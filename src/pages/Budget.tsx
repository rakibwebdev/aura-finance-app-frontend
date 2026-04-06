import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonModal,
    IonLoading,
    useIonToast,
} from "@ionic/react";
import { useState, useMemo, useRef, useEffect } from "react";
import { useBudget } from "../contexts/BudgetContext";
import { save, add } from "ionicons/icons";

function Budget() {
    const { budget, updateCategoryBudget, addCategory } = useBudget();
    const [presentToast] = useIonToast();
    const modal = useRef<HTMLIonModalElement>(null);
    const [budgets, setBudgets] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryBudget, setNewCategoryBudget] = useState<number>(0);
    const [newCategoryColor, setNewCategoryColor] = useState("#6366f1");

    useEffect(() => {
        const newBudgets = budget.categories.reduce(
            (acc, cat) => {
                acc[cat.id] = cat.allocated || 0;
                return acc;
            },
            {} as { [key: string]: number },
        );
        setBudgets(newBudgets);
    }, [budget.categories]);

    const totalBudget = useMemo(() => {
        return Object.values(budgets).reduce((sum, amount) => sum + amount, 0);
    }, [budgets]);

    const handleBudgetChange = (categoryId: string, value: number) => {
        setBudgets((prev) => ({
            ...prev,
            [categoryId]: value,
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updatePromises = Object.entries(budgets).map(
                ([categoryId, amount]) => {
                    const originalAmount = budget.categories.find(
                        (cat) => cat.id === categoryId,
                    )?.allocated;
                    if (amount !== originalAmount) {
                        return updateCategoryBudget(categoryId, amount);
                    }
                    return Promise.resolve();
                },
            );

            await Promise.all(updatePromises);
            await presentToast({
                message: "Budget saved successfully!",
                duration: 2000,
                position: "bottom",
                color: "success",
            });
        } catch (error) {
            await presentToast({
                message: "Failed to save budget",
                duration: 2000,
                position: "bottom",
                color: "danger",
            });
            console.error("Error saving budget:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            await presentToast({
                message: "Category name is required",
                duration: 2000,
                position: "bottom",
                color: "warning",
            });
            return;
        }

        setLoading(true);
        try {
            await addCategory(
                newCategoryName,
                newCategoryBudget,
                newCategoryColor,
            );
            await presentToast({
                message: "Category added successfully!",
                duration: 2000,
                position: "bottom",
                color: "success",
            });

            // Reset form
            setNewCategoryName("");
            setNewCategoryBudget(0);
            setNewCategoryColor("#6366f1");
            modal.current?.dismiss();
        } catch (error) {
            await presentToast({
                message: "Failed to add category",
                duration: 2000,
                position: "bottom",
                color: "danger",
            });
            console.error("Error adding category:", error);
        } finally {
            setLoading(false);
        }
    };

    const colorOptions = [
        "#3b82f6",
        "#8b5cf6",
        "#ec4899",
        "#f59e0b",
        "#10b981",
        "#ef4444",
        "#06b6d4",
        "#f97316",
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color='primary'>
                    <IonButtons slot='start'>
                        <IonBackButton defaultHref='/dashboard' />
                    </IonButtons>
                    <IonTitle>Budget Settings</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <div style={{ padding: "16px" }}>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>Total Weekly Budget</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <div
                                style={{
                                    fontSize: "2.5rem",
                                    fontWeight: "bold",
                                    color: "#0ea5e9",
                                    textAlign: "center",
                                    padding: "20px 0",
                                }}
                            >
                                ${totalBudget.toFixed(2)}
                            </div>
                        </IonCardContent>
                    </IonCard>

                    <IonCard>
                        <IonCardHeader>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <IonCardTitle>Budget by Category</IonCardTitle>
                                <IonButton
                                    fill='clear'
                                    id='add-category-modal'
                                    size='small'
                                >
                                    <IonIcon slot='icon-only' icon={add} />
                                </IonButton>
                            </div>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonList>
                                {budget.categories.map((category) => (
                                    <IonItem key={category.id}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                width: "100%",
                                                gap: "10px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "20px",
                                                    height: "20px",
                                                    borderRadius: "50%",
                                                    backgroundColor:
                                                        category.color,
                                                }}
                                            />
                                            <IonLabel position='stacked'>
                                                {category.name}
                                            </IonLabel>
                                        </div>
                                        <IonInput
                                            type='number'
                                            value={budgets[category.id] ?? 0}
                                            onIonInput={(e) =>
                                                handleBudgetChange(
                                                    category.id,
                                                    parseFloat(
                                                        e.detail.value!,
                                                    ) || 0,
                                                )
                                            }
                                            placeholder='0.00'
                                            style={{
                                                fontSize: "1.2rem",
                                                fontWeight: "500",
                                            }}
                                        />
                                    </IonItem>
                                ))}
                            </IonList>

                            <IonButton
                                expand='block'
                                onClick={handleSave}
                                disabled={loading}
                                style={{ marginTop: "20px" }}
                            >
                                <IonIcon slot='start' icon={save} />
                                {loading ? "Saving..." : "Save Budget"}
                            </IonButton>
                        </IonCardContent>
                    </IonCard>
                </div>

                <IonModal ref={modal} trigger='add-category-modal'>
                    <IonHeader>
                        <IonToolbar color='primary'>
                            <IonTitle>Add New Category</IonTitle>
                            <IonButtons slot='end'>
                                <IonButton
                                    onClick={() => modal.current?.dismiss()}
                                >
                                    Close
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        <div style={{ padding: "16px" }}>
                            <IonItem>
                                <IonLabel position='stacked'>
                                    Category Name
                                </IonLabel>
                                <IonInput
                                    value={newCategoryName}
                                    onIonInput={(e) =>
                                        setNewCategoryName(e.detail.value || "")
                                    }
                                    placeholder='Enter category name'
                                />
                            </IonItem>

                            <IonItem>
                                <IonLabel position='stacked'>
                                    Budget Limit
                                </IonLabel>
                                <IonInput
                                    type='number'
                                    value={newCategoryBudget}
                                    onIonInput={(e) =>
                                        setNewCategoryBudget(
                                            parseFloat(e.detail.value || "0") ||
                                                0,
                                        )
                                    }
                                    placeholder='0.00'
                                />
                            </IonItem>

                            <div
                                style={{
                                    marginTop: "20px",
                                    marginBottom: "20px",
                                }}
                            >
                                <IonLabel>Select Color</IonLabel>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(4, 1fr)",
                                        gap: "10px",
                                        marginTop: "10px",
                                    }}
                                >
                                    {colorOptions.map((color) => (
                                        <div
                                            key={color}
                                            onClick={() =>
                                                setNewCategoryColor(color)
                                            }
                                            style={{
                                                width: "100%",
                                                aspectRatio: "1",
                                                borderRadius: "8px",
                                                backgroundColor: color,
                                                cursor: "pointer",
                                                border:
                                                    newCategoryColor === color
                                                        ? "3px solid #000"
                                                        : "none",
                                                transition: "all 0.3s",
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <IonButton
                                expand='block'
                                color='primary'
                                onClick={handleAddCategory}
                                disabled={loading}
                            >
                                {loading ? "Adding..." : "Add Category"}
                            </IonButton>
                        </div>
                    </IonContent>
                </IonModal>

                <IonLoading isOpen={loading} message='Loading...' />
            </IonContent>
        </IonPage>
    );
}

export default Budget;
