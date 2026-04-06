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
} from "@ionic/react";
import { useBudget } from "../contexts/BudgetContext";

import "./Goals.css";
import DreamVisualizer from "../components/DreamVisualizer";
const Goals: React.FC = () => {
    const { goal, updateGoalProgress } = useBudget();

    if (!goal) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar color='primary'>
                        <IonButtons slot='start'>
                            <IonBackButton defaultHref='/dashboard' />
                        </IonButtons>
                        <IonTitle>Goals</IonTitle>
                    </IonToolbar>
                </IonHeader>
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

    const handleAddSavings = () => {
        // In a real app, this would open a modal to add savings
        updateGoalProgress(1000);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color='primary'>
                    <IonButtons slot='start'>
                        <IonBackButton defaultHref='/dashboard' />
                    </IonButtons>
                    <IonTitle>3D Goal Materialization</IonTitle>
                </IonToolbar>
            </IonHeader>
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
                        onClick={handleAddSavings}
                        className='add-savings-btn'
                    >
                        Add Savings
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Goals;
