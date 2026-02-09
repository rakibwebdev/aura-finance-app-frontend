import React, { useState } from "react";
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
} from "@ionic/react";
import { Capacitor } from "@capacitor/core";
import { useBudget } from "../contexts/BudgetContext";
import ImpactDisplay from "../components/ImpactDisplay";
import OpportunityCostDisplay from "../components/OpportunityCostDisplay";
import "./Scanner.css";
import {
    CapacitorBarcodeScanner,
    CapacitorBarcodeScannerTypeHintALLOption,
} from "@capacitor/barcode-scanner";

const Scanner: React.FC = () => {
    const {
        calculateImpactFactor,
        calculateOpportunityCost,
        addTransaction,
        budget,
    } = useBudget();
    const [scanning, setScanning] = useState(false);
    const [scannedProduct, setScannedProduct] = useState<{
        barcode: string;
        name: string;
        price: number;
        category: string;
    } | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Check if running on web or native
    const isWeb = Capacitor.getPlatform() === "web";

    const mockScan = () => {
        // Simulate scanning for web/browser testing
        setScanning(true);

        setTimeout(() => {
            const mockProducts = [
                { name: "Wireless Headphones", price: 89.99, category: "Tech" },
                { name: "Coffee Maker", price: 45.5, category: "Other" },
                { name: "Grocery Items", price: 32.75, category: "Groceries" },
                {
                    name: "Movie Ticket",
                    price: 15.0,
                    category: "Entertainment",
                },
                { name: "USB-C Cable", price: 12.99, category: "Tech" },
            ];

            const randomProduct =
                mockProducts[Math.floor(Math.random() * mockProducts.length)];

            const mockProduct = {
                barcode: Math.random().toString(36).substring(7).toUpperCase(),
                ...randomProduct,
            };

            setScannedProduct(mockProduct);
            setShowModal(true);
            setScanning(false);
        }, 2000); // Simulate 2 second scan
    };

    const startScan = async () => {
        // If running on web, use mock scanner
        if (isWeb) {
            mockScan();
            return;
        }

        // Native camera scanning
        try {
            setScanning(true);
            document.body.classList.add("scanner-active");

            const result = await CapacitorBarcodeScanner.scanBarcode({
                hint: CapacitorBarcodeScannerTypeHintALLOption.ALL,
            });

            if (result.ScanResult) {
                // Simulate product lookup (in production, this would call an API)
                const mockProduct = {
                    barcode: result.ScanResult,
                    name: "Sample Product",
                    price: Math.random() * 100 + 10, // Random price between $10-$110
                    category: "Other",
                };

                setScannedProduct(mockProduct);
                setShowModal(true);
            }
        } catch (error) {
            console.error("Scan error:", error);
            alert("Failed to start scanner: " + (error as Error).message);
        } finally {
            stopScan();
        }
    };

    const stopScan = () => {
        setScanning(false);
        document.body.classList.remove("scanner-active");
    };

    const confirmPurchase = () => {
        if (scannedProduct) {
            addTransaction({
                name: scannedProduct.name,
                amount: scannedProduct.price,
                category: scannedProduct.category,
                barcode: scannedProduct.barcode,
            });
            setShowModal(false);
            setScannedProduct(null);
        }
    };

    const cancelPurchase = () => {
        setShowModal(false);
        setScannedProduct(null);
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
                {!scanning && (
                    <div className='scanner-idle'>
                        {isWeb && (
                            <IonNote color='warning' className='demo-badge'>
                                🖥️ Web Demo Mode - Random products will be
                                simulated
                            </IonNote>
                        )}
                        <div className='scanner-instructions'>
                            <h2>AR Decision Support</h2>
                            <p>
                                {isWeb
                                    ? "Click the button below to simulate scanning a product"
                                    : "Point your camera at a product barcode to see its impact on your budget"}
                            </p>
                            <IonButton
                                expand='block'
                                size='large'
                                onClick={startScan}
                                className='scan-button'
                            >
                                {isWeb ? "Simulate Scan" : "Start Scanning"}
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

                {/* Scanning Overlay */}
                {scanning && (
                    <div className='scanner-overlay'>
                        <div className='scan-region'>
                            <div className='scan-frame'></div>
                            <p>
                                {isWeb
                                    ? "Simulating scan..."
                                    : "Align barcode within frame"}
                            </p>
                        </div>
                        {!isWeb && (
                            <IonButton
                                onClick={stopScan}
                                color='light'
                                className='cancel-scan'
                            >
                                Cancel
                            </IonButton>
                        )}
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
                                <IonCard>
                                    <IonCardHeader>
                                        <IonCardTitle>
                                            {scannedProduct.name}
                                        </IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <h2 className='product-price'>
                                            ${scannedProduct.price.toFixed(2)}
                                        </h2>
                                        <IonItem>
                                            <IonLabel position='stacked'>
                                                Product Name
                                            </IonLabel>
                                            <IonInput
                                                value={scannedProduct.name}
                                                onIonChange={(e) =>
                                                    setScannedProduct({
                                                        ...scannedProduct,
                                                        name: e.detail.value!,
                                                    })
                                                }
                                            />
                                        </IonItem>
                                        <IonItem>
                                            <IonLabel position='stacked'>
                                                Price
                                            </IonLabel>
                                            <IonInput
                                                type='number'
                                                value={scannedProduct.price}
                                                onIonChange={(e) =>
                                                    setScannedProduct({
                                                        ...scannedProduct,
                                                        price:
                                                            parseFloat(
                                                                e.detail.value!,
                                                            ) || 0,
                                                    })
                                                }
                                            />
                                        </IonItem>
                                        <IonItem>
                                            <IonLabel>Category</IonLabel>
                                            <IonSelect
                                                value={scannedProduct.category}
                                                onIonChange={(e) =>
                                                    setScannedProduct({
                                                        ...scannedProduct,
                                                        category:
                                                            e.detail.value,
                                                    })
                                                }
                                            >
                                                {budget.categories.map(
                                                    (cat) => (
                                                        <IonSelectOption
                                                            key={cat.id}
                                                            value={cat.name}
                                                        >
                                                            {cat.name}
                                                        </IonSelectOption>
                                                    ),
                                                )}
                                            </IonSelect>
                                        </IonItem>
                                    </IonCardContent>
                                </IonCard>

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
