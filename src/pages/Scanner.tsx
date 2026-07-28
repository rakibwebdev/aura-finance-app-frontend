import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { useBudget } from "../contexts/BudgetContext";
import ImpactDisplay from "../components/ImpactDisplay";
import OpportunityCostDisplay from "../components/OpportunityCostDisplay";
import PageHeader from "../components/PageHeader";
import "./Scanner.css";

// Import the new JS Scanner
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import axios from "axios";

const UNCATEGORIZED = "Uncategorized";

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

    // Use a ref to store the scanner instance so it persists between renders
    const scannerRef = useRef<Html5Qrcode | null>(null);

    // Cleanup the scanner when navigating away from the page
    useEffect(() => {
        return () => {
            document.body.classList.remove("scanner-active");
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
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

    const stopScan = useCallback(async () => {
        setScanning(false);
        document.body.classList.remove("scanner-active");

        // Stop the camera feed safely
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (e) {
                console.error("Error stopping scanner:", e);
            }
        }
    }, []);

    // Initialize the JS scanner when the 'scanning' state becomes true
    useEffect(() => {
        if (!scanning) return;

        const startHtml5Qrcode = async () => {
            try {
                if (!scannerRef.current) {
                    // This targets the div with id="reader" inside our render block
                    scannerRef.current = new Html5Qrcode("reader");
                }

                await scannerRef.current.start(
                    { facingMode: "environment" }, // Request rear camera
                    {
                        fps: 10, // Frames per second
                        qrbox: { width: 250, height: 250 }, // Visual scanner box
                    },

                    async (decodedText) => {
                        // On Success
                        await stopScan();
                        await fetchProductByBarcode(decodedText);
                    },

                    (errorMessage) => {
                        // On Error: The library throws a warning every single frame it doesn't see a barcode.
                        // We safely ignore this to prevent console spam.
                    },
                );
            } catch (err) {
                console.error("Failed to start scanner:", err);
                setError(
                    "Camera access denied or unavailable. Please ensure permissions are granted in your browser settings.",
                );
                setScanning(false);
                document.body.classList.remove("scanner-active");
            }
        };

        startHtml5Qrcode();
    }, [scanning, fetchProductByBarcode, stopScan]);

    const startScan = useCallback(() => {
        setError("");
        document.body.classList.add("scanner-active");
        setScanning(true);
    }, []);

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

                {/* Always render the container in the DOM, but hide it if not scanning to prevent React rendering conflicts with the JS library */}
                <div
                    style={{ display: scanning ? "block" : "none" }}
                    className='scanner-overlay'
                >
                    <div
                        className='scan-region'
                        style={{
                            width: "100%",
                            maxWidth: "600px",
                            margin: "0 auto",
                            position: "relative",
                        }}
                    >
                        {/* The HTML5 QR code library injects the video element directly into this div */}
                        <div id='reader' style={{ width: "100%" }}></div>
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
                                                // We can now allow manual edits on all platforms natively
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
