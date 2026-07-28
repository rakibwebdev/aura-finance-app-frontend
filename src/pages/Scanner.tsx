import React, { useEffect, useState, useCallback } from "react";
import {
    IonPage,
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButtons,
    IonModal,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonNote,
    IonSpinner,
    IonHeader,
    IonToolbar,
    IonTitle,
} from "@ionic/react";
import { Capacitor } from "@capacitor/core";
import { useBudget } from "../contexts/BudgetContext";
import ImpactDisplay from "../components/ImpactDisplay";
import OpportunityCostDisplay from "../components/OpportunityCostDisplay";
import PageHeader from "../components/PageHeader";
import "./Scanner.css";
import {
    CapacitorBarcodeScanner,
    CapacitorBarcodeScannerCameraDirection,
    CapacitorBarcodeScannerTypeHintALLOption,
} from "@capacitor/barcode-scanner";
import { CapacitorBarcodeScannerWeb } from "@capacitor/barcode-scanner/dist/esm/web";
import axios from "axios";

const IS_WEB_PLATFORM = Capacitor.getPlatform() === "web";

const BARCODE_SCAN_OPTIONS = {
    hint: CapacitorBarcodeScannerTypeHintALLOption.ALL,
    cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
};

const UNCATEGORIZED = "Uncategorized";

const ERROR_CODE_MESSAGES: Record<string, string> = {
    "OS-PLUG-BARC-0007":
        "Camera access denied. Enable camera permission in iOS Settings > Aura Finance.",
    UNIMPLEMENTED:
        "Barcode plugin is not linked in the iOS target. In Xcode, add the local package ios/App/CapApp-SPM to the App target, then rebuild.",
    "OS-PLUG-BARC-0006": "Scanner was cancelled.",
    "OS-PLUG-BARC-0004":
        "iOS scanner failed to start. If you are on Simulator, test on a physical iPhone.",
};

interface ScannedProduct {
    barcode: string;
    name: string;
    price: number;
}

interface ProductApiResponse {
    data: {
        barcode: string;
        name: string;
        price: number;
    };
}

function parseScanError(error: unknown): { message: string; code?: string } {
    const errorObject =
        typeof error === "object" && error !== null
            ? (error as { message?: string; code?: string })
            : null;

    const message =
        errorObject?.message ??
        (error instanceof Error ? error.message : String(error));

    return { message, code: errorObject?.code };
}

function getErrorMessage(
    code: string | undefined,
    fallbackMessage: string,
): string {
    if (code && ERROR_CODE_MESSAGES[code]) {
        return ERROR_CODE_MESSAGES[code];
    }
    return `Failed to start scanner${
        code ? ` (${code})` : ""
    }: ${fallbackMessage}`;
}

const Scanner: React.FC = () => {
    const {
        calculateImpactFactor,
        calculateOpportunityCost,
        addTransaction,
        budget,
    } = useBudget();

    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(
        null,
    );
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

    useEffect(() => {
        return () => {
            document.body.classList.remove("scanner-active");
        };
    }, []);

    const scanBarcodeOnWeb = useCallback(async () => {
        const webScanner = new CapacitorBarcodeScannerWeb();
        return webScanner.scanBarcode({
            ...BARCODE_SCAN_OPTIONS,
            web: {
                showCameraSelection: false,
                scannerFPS: 30,
            },
        });
    }, []);

    const fetchProductByBarcode = useCallback(async (barcode: string) => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get<ProductApiResponse>(
                `${import.meta.env.VITE_API_URL}/api/products/${barcode}`,
            );

            const product = response.data.data;

            setScannedProduct({
                barcode: product.barcode,
                name: product.name,
                price: product.price,
            });
            setShowModal(true);
        } catch (err) {
            console.error("Error fetching product:", err);

            if (axios.isAxiosError(err) && err.response?.status === 404) {
                setError("Product not found. Please enter details manually.");

                setScannedProduct({ barcode, name: "", price: 0 });
                setShowModal(true);
            } else {
                setError("Failed to fetch product. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const stopScan = useCallback(() => {
        setScanning(false);
        document.body.classList.remove("scanner-active");
    }, []);

    const startScan = useCallback(async () => {
        setScanning(true);
        setError("");
        document.body.classList.add("scanner-active");

        try {
            const result = IS_WEB_PLATFORM
                ? await scanBarcodeOnWeb()
                : await CapacitorBarcodeScanner.scanBarcode(
                      BARCODE_SCAN_OPTIONS,
                  );

            if (result.ScanResult) {
                stopScan();
                await fetchProductByBarcode(result.ScanResult);
            }
        } catch (err: unknown) {
            console.error("Scan error:", err);

            const { message, code } = parseScanError(err);
            const shouldFallbackToWebScanner =
                !IS_WEB_PLATFORM && /not implemented/i.test(message);

            if (shouldFallbackToWebScanner) {
                try {
                    const fallbackResult = await scanBarcodeOnWeb();
                    if (fallbackResult.ScanResult) {
                        stopScan();
                        await fetchProductByBarcode(fallbackResult.ScanResult);
                    }
                    return;
                } catch (fallbackError) {
                    console.error(
                        "Web scanner fallback failed:",
                        fallbackError,
                    );
                }
            }

            setError(getErrorMessage(code, message));
            stopScan();
        }
    }, [fetchProductByBarcode, scanBarcodeOnWeb, stopScan]);

    const updateScannedProductField = useCallback(
        <K extends keyof ScannedProduct>(
            field: K,
            value: ScannedProduct[K],
        ) => {
            setScannedProduct((prev) =>
                prev ? { ...prev, [field]: value } : prev,
            );
        },
        [],
    );

    const resetModalState = useCallback(() => {
        setShowModal(false);
        setScannedProduct(null);
        setSelectedCategoryId("");
        setError("");
    }, []);

    const confirmPurchase = useCallback(() => {
        if (!scannedProduct) return;

        const trimmedName = scannedProduct.name.trim();
        if (!trimmedName || scannedProduct.price <= 0) {
            setError("Please enter valid product name and price");
            return;
        }

        const selectedCategory = budget.categories.find(
            (cat) => cat.id === selectedCategoryId,
        );

        addTransaction({
            name: trimmedName,
            amount: scannedProduct.price,
            category: selectedCategory?.name ?? UNCATEGORIZED,
            categoryId: selectedCategoryId || undefined,
            barcode: scannedProduct.barcode,
        });

        resetModalState();
    }, [
        scannedProduct,
        selectedCategoryId,
        budget.categories,
        addTransaction,
        resetModalState,
    ]);

    return (
        <IonPage>
            <PageHeader title='Aura Vision' backHref='/dashboard' />
            <IonContent fullscreen className='scanner-content'>
                {!scanning && !loading && (
                    <div className='scanner-idle'>
                        {error && (
                            <IonNote color='danger' className='error-message'>
                                {error}
                            </IonNote>
                        )}
                        <div className='scanner-instructions'>
                            <h2>AR Decision Support</h2>
                            <p>
                                Point your camera at a product barcode to see
                                its impact on your budget
                            </p>
                            <IonButton
                                expand='block'
                                size='large'
                                onClick={startScan}
                                className='scan-button'
                            >
                                Start Scanning
                            </IonButton>
                        </div>

                        <IonCard>
                            <IonCardHeader>
                                <IonCardTitle>How it works</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <IonList>
                                    <IonItem>
                                        <IonLabel className='ion-text-wrap'>
                                            <h3>📊 Impact Factor</h3>
                                            <p>
                                                See how much of your weekly
                                                budget this purchase will
                                                consume
                                            </p>
                                        </IonLabel>
                                    </IonItem>
                                    <IonItem>
                                        <IonLabel className='ion-text-wrap'>
                                            <h3>⚠️ Visual Warnings</h3>
                                            <p>
                                                Color-coded alerts help you make
                                                informed decisions
                                            </p>
                                        </IonLabel>
                                    </IonItem>
                                    <IonItem>
                                        <IonLabel className='ion-text-wrap'>
                                            <h3>💡 Opportunity Cost</h3>
                                            <p>
                                                Understand what you're giving up
                                                by making this purchase
                                            </p>
                                        </IonLabel>
                                    </IonItem>
                                </IonList>
                            </IonCardContent>
                        </IonCard>
                    </div>
                )}

                {loading && (
                    <div className='scanner-loading'>
                        <IonSpinner name='crescent' />
                        <p>Fetching product details...</p>
                    </div>
                )}

                {scanning && (
                    <div className='scanner-overlay'>
                        <div className='scan-region'>
                            <div className='scan-frame'></div>
                            <p>Align barcode within frame</p>
                        </div>
                        <IonButton
                            onClick={stopScan}
                            color='light'
                            className='cancel-scan'
                        >
                            Cancel
                        </IonButton>
                    </div>
                )}

                <IonModal isOpen={showModal} onDidDismiss={resetModalState}>
                    <IonHeader>
                        <IonToolbar color='primary'>
                            <IonTitle>Purchase Analysis</IonTitle>
                            <IonButtons slot='end'>
                                <IonButton onClick={resetModalState}>
                                    Close
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className='modal-content'>
                        {scannedProduct && (
                            <>
                                {error && (
                                    <IonNote
                                        color='warning'
                                        style={{
                                            display: "block",
                                            padding: "16px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {error}
                                    </IonNote>
                                )}
                                <IonCard>
                                    <IonCardHeader>
                                        <IonCardTitle>
                                            Product Details
                                        </IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <IonItem>
                                            <IonLabel position='stacked'>
                                                Barcode
                                            </IonLabel>
                                            <IonInput
                                                value={scannedProduct.barcode}
                                                disabled={!IS_WEB_PLATFORM}
                                                onIonInput={(e) =>
                                                    updateScannedProductField(
                                                        "barcode",
                                                        e.detail.value ?? "",
                                                    )
                                                }
                                            />
                                        </IonItem>
                                        <IonItem>
                                            <IonLabel position='stacked'>
                                                Product Name
                                            </IonLabel>
                                            <IonInput
                                                value={scannedProduct.name}
                                                onIonInput={(e) =>
                                                    updateScannedProductField(
                                                        "name",
                                                        e.detail.value ?? "",
                                                    )
                                                }
                                                placeholder='Enter product name'
                                            />
                                        </IonItem>
                                        <IonItem>
                                            <IonLabel position='stacked'>
                                                Price ($)
                                            </IonLabel>
                                            <IonInput
                                                type='number'
                                                value={scannedProduct.price}
                                                onIonInput={(e) =>
                                                    updateScannedProductField(
                                                        "price",
                                                        parseFloat(
                                                            e.detail.value ??
                                                                "",
                                                        ) || 0,
                                                    )
                                                }
                                                placeholder='Enter price'
                                            />
                                        </IonItem>
                                        <IonItem>
                                            <IonLabel>Category</IonLabel>
                                            <IonSelect
                                                value={selectedCategoryId}
                                                onIonChange={(e) =>
                                                    setSelectedCategoryId(
                                                        e.detail.value,
                                                    )
                                                }
                                                placeholder='Select a category'
                                            >
                                                {budget.categories.map(
                                                    (cat) => (
                                                        <IonSelectOption
                                                            key={cat.id}
                                                            value={cat.id}
                                                        >
                                                            {cat.name}
                                                        </IonSelectOption>
                                                    ),
                                                )}
                                            </IonSelect>
                                        </IonItem>
                                    </IonCardContent>
                                </IonCard>

                                {scannedProduct.price > 0 && (
                                    <>
                                        <ImpactDisplay
                                            impact={calculateImpactFactor(
                                                scannedProduct.price,
                                            )}
                                        />
                                        <OpportunityCostDisplay
                                            opportunityCost={calculateOpportunityCost(
                                                scannedProduct.price,
                                            )}
                                        />
                                    </>
                                )}

                                <div className='action-buttons'>
                                    <IonButton
                                        expand='block'
                                        color='danger'
                                        onClick={resetModalState}
                                        className='cancel-button'
                                    >
                                        Don't Buy
                                    </IonButton>
                                    <IonButton
                                        expand='block'
                                        color='success'
                                        onClick={confirmPurchase}
                                        className='confirm-button'
                                    >
                                        Confirm Purchase
                                    </IonButton>
                                </div>
                            </>
                        )}
                    </IonContent>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default Scanner;
