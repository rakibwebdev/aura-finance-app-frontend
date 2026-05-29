import React, { useEffect, useState } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonBackButton,
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
} from "@ionic/react";
import { Capacitor } from "@capacitor/core";
import { useBudget } from "../contexts/BudgetContext";
import ImpactDisplay from "../components/ImpactDisplay";
import OpportunityCostDisplay from "../components/OpportunityCostDisplay";
import "./Scanner.css";
import {
    CapacitorBarcodeScanner,
    CapacitorBarcodeScannerCameraDirection,
    CapacitorBarcodeScannerTypeHintALLOption,
} from "@capacitor/barcode-scanner";
import { CapacitorBarcodeScannerWeb } from "@capacitor/barcode-scanner/dist/esm/web";
import axios from "axios";

const Scanner: React.FC = () => {
    const {
        calculateImpactFactor,
        calculateOpportunityCost,
        addTransaction,
        budget,
    } = useBudget();
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scannedProduct, setScannedProduct] = useState<{
        barcode: string;
        name: string;
        price: number;
    } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

    const isWebPlatform = Capacitor.getPlatform() === "web";
    const barcodeScanOptions = {
        hint: CapacitorBarcodeScannerTypeHintALLOption.ALL,
        cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
    };

    const scanBarcodeOnWeb = async () => {
        const webScanner = new CapacitorBarcodeScannerWeb();
        return webScanner.scanBarcode({
            ...barcodeScanOptions,
            web: {
                showCameraSelection: false,
                scannerFPS: 30,
            },
        });
    };

    const fetchProductByBarcode = async (barcode: string) => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
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
                // Show modal with empty product for manual entry
                setScannedProduct({
                    barcode: barcode,
                    name: "",
                    price: 0,
                });
                setShowModal(true);
            } else {
                setError("Failed to fetch product. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const startScan = async () => {
        try {
            setScanning(true);
            setError("");
            document.body.classList.add("scanner-active");

            const result = isWebPlatform
                ? await scanBarcodeOnWeb()
                : await CapacitorBarcodeScanner.scanBarcode(barcodeScanOptions);

            if (result.ScanResult) {
                stopScan();
                await fetchProductByBarcode(result.ScanResult);
            }
        } catch (error) {
            console.error("Scan error:", error);

            const errorMessage =
                error instanceof Error ? error.message : String(error);
            const shouldFallbackToWebScanner =
                !isWebPlatform && /not implemented/i.test(errorMessage);

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

            setError("Failed to start scanner: " + errorMessage);
            stopScan();
        }
    };

    const stopScan = () => {
        setScanning(false);
        document.body.classList.remove("scanner-active");
    };

    const confirmPurchase = () => {
        if (scannedProduct) {
            // Validate fields
            if (!scannedProduct.name || scannedProduct.price <= 0) {
                setError("Please enter valid product name and price");
                return;
            }

            // Find selected category to get its name
            const selectedCategory = budget.categories.find(
                (cat) => cat.id === selectedCategoryId,
            );

            addTransaction({
                name: scannedProduct.name,
                amount: scannedProduct.price,
                category: selectedCategory?.name || "Uncategorized",
                categoryId: selectedCategoryId || undefined,
                barcode: scannedProduct.barcode,
            });
            setShowModal(false);
            setScannedProduct(null);
            setSelectedCategoryId("");
            setError("");
        }
    };

    const cancelPurchase = () => {
        setShowModal(false);
        setScannedProduct(null);
        setSelectedCategoryId("");
        setError("");
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color='primary'>
                    <IonButtons slot='start'>
                        <IonBackButton defaultHref='/dashboard' />
                    </IonButtons>
                    <IonTitle>Aura Vision</IonTitle>
                </IonToolbar>
            </IonHeader>
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

                {/* Loading State */}
                {loading && (
                    <div className='scanner-loading'>
                        <IonSpinner name='crescent' />
                        <p>Fetching product details...</p>
                    </div>
                )}

                {/* Scanning Overlay */}
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

                {/* Product Analysis Modal */}
                <IonModal isOpen={showModal} onDidDismiss={cancelPurchase}>
                    <IonHeader>
                        <IonToolbar color='primary'>
                            <IonTitle>Purchase Analysis</IonTitle>
                            <IonButtons slot='end'>
                                <IonButton onClick={cancelPurchase}>
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
                                                disabled={!isWebPlatform}
                                                onIonInput={(e) =>
                                                    setScannedProduct({
                                                        ...scannedProduct,
                                                        barcode:
                                                            e.detail.value!,
                                                    })
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
                                                    setScannedProduct({
                                                        ...scannedProduct,
                                                        name: e.detail.value!,
                                                    })
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
                                                    setScannedProduct({
                                                        ...scannedProduct,
                                                        price:
                                                            parseFloat(
                                                                e.detail.value!,
                                                            ) || 0,
                                                    })
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
                                        onClick={cancelPurchase}
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
