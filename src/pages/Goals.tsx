import React, { useState } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonProgressBar,
    IonButton,
    IonBackButton,
    IonButtons,
    IonModal,
    IonInput,
    IonText,
} from "@ionic/react";
import { useBudget } from "../contexts/BudgetContext";
import PageHeader from "../components/PageHeader";

import "./Goals.css";
import DreamVisualizer from "../components/DreamVisualizer";
const Goals: React.FC = () => {
    const { goal, updateGoalProgress, setGoal } = useBudget();
    const [showAddSavingsModal, setShowAddSavingsModal] = useState(false);
    const [showGoalAmountModal, setShowGoalAmountModal] = useState(false);
    const [savingsAmount, setSavingsAmount] = useState("1000");
    const [goalAmount, setGoalAmount] = useState("3000");
    const [savingsError, setSavingsError] = useState("");
    const [goalAmountError, setGoalAmountError] = useState("");

    if (!goal) {
        return (
            <IonPage>
                <PageHeader title='Goals' backHref='/dashboard' />
                <IonContent>
                    <div className='no-goal'>
                        <h2>No Goal Set</h2>
                        <p>Set a financial goal to see your 3D visualization</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    const progressPercentage = (goal.savedAmount / goal.targetAmount) * 100;

    const getProgressDescription = () => {
        if (progressPercentage >= 100) {
            return "🎉 Fully Rendered - Goal Achieved!";
        } else if (progressPercentage >= 26) {
            return "⚙️ Chassis & Details Visible";
        } else {
            return "📐 Wireframe Stage";
        }
    };

    const openAddSavingsModal = () => {
        setSavingsError("");
        setSavingsAmount("1000");
        setShowAddSavingsModal(true);
    };

    const openGoalAmountModal = () => {
        setGoalAmountError("");
        setGoalAmount(String(goal.targetAmount));
        setShowGoalAmountModal(true);
    };

    const closeAddSavingsModal = () => {
        setShowAddSavingsModal(false);
        setSavingsError("");
    };

    const closeGoalAmountModal = () => {
        setShowGoalAmountModal(false);
        setGoalAmountError("");
    };

    const handleSaveSavings = () => {
        const amount = Number(savingsAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setSavingsError("Enter a valid savings amount greater than 0.");
            return;
        }

        updateGoalProgress(amount);
        closeAddSavingsModal();
    };

    const handleSaveGoalAmount = () => {
        const amount = Number(goalAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setGoalAmountError("Enter a valid goal amount greater than 0.");
            return;
        }

        setGoal({
            ...goal,
            targetAmount: amount,
        });
        closeGoalAmountModal();
    };

    const handleResetGoal = () => {
        const shouldReset = window.confirm(
            "Reset your saved goal amount to 0? This will clear your current progress.",
        );

        if (!shouldReset) return;

        setGoal({
            ...goal,
            savedAmount: 0,
        });
    };

    return (
        <IonPage>
            <PageHeader title='3D Goal Materialization' backHref='/dashboard' />
            <IonContent fullscreen className='goals-content'>
                {/* 3D Visualizer */}
                <div className='ar-visualizer-container'>
                    <DreamVisualizer goal={goal} />
                </div>

                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Dream Engine</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <div className='visualizer-controls'>
                            <p className='control-hint'>
                                🔄 Rotate • 🔍 Pinch to zoom • Your {goal.name}{" "}
                                evolves as you save!
                            </p>
                        </div>
                    </IonCardContent>
                </IonCard>

                {/* Progress Stages */}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Progress Stages</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <div className='stage-list'>
                            <div
                                className={`stage-item ${
                                    progressPercentage >= 0 ? "active" : ""
                                }`}
                            >
                                <div className='stage-icon'>📐</div>
                                <div className='stage-details'>
                                    <h3>Wireframe (0-25%)</h3>
                                    <p>Faint mesh outline of your goal</p>
                                </div>
                            </div>
                            <div
                                className={`stage-item ${
                                    progressPercentage >= 26 ? "active" : ""
                                }`}
                            >
                                <div className='stage-icon'>⚙️</div>
                                <div className='stage-details'>
                                    <h3>Partial (26-75%)</h3>
                                    <p>Chassis and mechanical details appear</p>
                                </div>
                            </div>
                            <div
                                className={`stage-item ${
                                    progressPercentage >= 100 ? "active" : ""
                                }`}
                            >
                                <div className='stage-icon'>✨</div>
                                <div className='stage-details'>
                                    <h3>Complete (100%)</h3>
                                    <p>
                                        Fully rendered with lighting and
                                        textures
                                    </p>
                                </div>
                            </div>
                        </div>
                    </IonCardContent>
                </IonCard>

                {/* Action Button */}
                <div className='goal-actions'>
                    <IonButton
                        expand='block'
                        size='large'
                        onClick={openAddSavingsModal}
                        className='add-savings-btn'
                    >
                        Add Savings
                    </IonButton>
                    <IonButton
                        expand='block'
                        fill='outline'
                        color='medium'
                        onClick={openGoalAmountModal}
                        className='goal-amount-btn'
                    >
                        Set Goal Amount
                    </IonButton>
                    <IonButton
                        expand='block'
                        fill='outline'
                        color='medium'
                        onClick={handleResetGoal}
                        className='reset-goal-btn'
                    >
                        Reset Goal Amount
                    </IonButton>
                </div>

                <IonModal
                    isOpen={showAddSavingsModal}
                    onDidDismiss={closeAddSavingsModal}
                    className='add-savings-modal'
                >
                    <IonHeader>
                        <IonToolbar color='primary'>
                            <IonTitle>Add Savings</IonTitle>
                            <IonButtons slot='end'>
                                <IonButton onClick={closeAddSavingsModal}>
                                    Cancel
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>

                    <IonCard className='add-savings-card'>
                        <IonCardHeader>
                            <IonCardTitle>Add savings amount</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonInput
                                type='number'
                                inputMode='decimal'
                                min='0'
                                step='0.01'
                                value={savingsAmount}
                                placeholder='Enter savings amount'
                                label={`Amount (${goal.currency})`}
                                labelPlacement='floating'
                                fill='outline'
                                className='add-savings-input'
                                onIonInput={(event) =>
                                    setSavingsAmount(event.detail.value ?? "")
                                }
                            />

                            {savingsError && (
                                <IonText color='danger'>
                                    <p className='add-savings-error'>
                                        {savingsError}
                                    </p>
                                </IonText>
                            )}

                            <div className='add-savings-actions'>
                                <IonButton
                                    expand='block'
                                    onClick={handleSaveSavings}
                                    className='add-savings-confirm-btn'
                                >
                                    Save Savings
                                </IonButton>
                            </div>
                        </IonCardContent>
                    </IonCard>
                </IonModal>

                <IonModal
                    isOpen={showGoalAmountModal}
                    onDidDismiss={closeGoalAmountModal}
                    className='goal-amount-modal'
                >
                    <IonHeader>
                        <IonToolbar color='primary'>
                            <IonTitle>Set Goal Amount</IonTitle>
                            <IonButtons slot='end'>
                                <IonButton onClick={closeGoalAmountModal}>
                                    Cancel
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>

                    <IonCard className='goal-amount-card'>
                        <IonCardHeader>
                            <IonCardTitle>Update your target</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <p className='goal-amount-hint'>
                                Current goal: {goal.currency}
                                {goal.targetAmount.toLocaleString()}
                            </p>

                            <IonInput
                                type='number'
                                inputMode='decimal'
                                min='0'
                                step='0.01'
                                value={goalAmount}
                                placeholder='Enter goal amount'
                                label={`Goal Amount (${goal.currency})`}
                                labelPlacement='floating'
                                fill='outline'
                                className='goal-amount-input'
                                onIonInput={(event) =>
                                    setGoalAmount(event.detail.value ?? "")
                                }
                            />

                            {goalAmountError && (
                                <IonText color='danger'>
                                    <p className='goal-amount-error'>
                                        {goalAmountError}
                                    </p>
                                </IonText>
                            )}

                            <div className='goal-amount-actions'>
                                <IonButton
                                    expand='block'
                                    onClick={handleSaveGoalAmount}
                                    className='goal-amount-confirm-btn'
                                >
                                    Save Goal Amount
                                </IonButton>
                            </div>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default Goals;
