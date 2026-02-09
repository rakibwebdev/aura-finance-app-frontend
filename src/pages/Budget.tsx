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
} from "@ionic/react";
import { useState, useMemo } from "react";
import { useBudget } from "../contexts/BudgetContext";
import { save } from "ionicons/icons";

function Budget() {
    const { budget, updateCategoryBudget } = useBudget();
    const [budgets, setBudgets] = useState<{ [key: string]: number }>(
        budget.categories.reduce(
            (acc, cat) => {
                acc[cat.id] = cat.budgetLimit || 0;
                return acc;
            },
            {} as { [key: string]: number },
        ),
    );

    const totalBudget = useMemo(() => {
        return Object.values(budgets).reduce((sum, amount) => sum + amount, 0);
    }, [budgets]);

    const handleBudgetChange = (categoryId: string, value: number) => {
        setBudgets((prev) => ({
            ...prev,
            [categoryId]: value,
        }));
    };

    const handleSave = () => {
        Object.entries(budgets).forEach(([categoryId, amount]) => {
            updateCategoryBudget(categoryId, amount);
        });
    };

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
                            <IonCardTitle>Budget by Category</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonList>
                                {budget.categories.map((category) => (
                                    <IonItem key={category.id}>
                                        <IonLabel position='stacked'>
                                            {category.name}
                                        </IonLabel>
                                        <IonInput
                                            type='number'
                                            value={budgets[category.id]}
                                            onIonChange={(e) =>
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
                                style={{ marginTop: "20px" }}
                            >
                                <IonIcon slot='start' icon={save} />
                                Save Budget
                            </IonButton>
                        </IonCardContent>
                    </IonCard>
                </div>
            </IonContent>
        </IonPage>
    );
}

export default Budget;
