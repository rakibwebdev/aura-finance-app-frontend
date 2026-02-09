import React from "react";
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
} from "@ionic/react";
import { ImpactFactor } from "../types";
import "./ImpactDisplay.css";

interface ImpactDisplayProps {
    impact: ImpactFactor;
}

const ImpactDisplay: React.FC<ImpactDisplayProps> = ({ impact }) => {
    const getWarningColor = () => {
        switch (impact.warningLevel) {
            case "safe":
                return "#06b6d4"; // Cyan
            case "caution":
                return "#f59e0b"; // Amber
            case "danger":
                return "#ef4444"; // Red
            default:
                return "#06b6d4";
        }
    };

    const getWarningMessage = () => {
        switch (impact.warningLevel) {
            case "safe":
                return "✓ Safe Purchase";
            case "caution":
                return "⚠️ Moderate Impact";
            case "danger":
                return "🚨 High Impact";
            default:
                return "";
        }
    };

    return (
        <IonCard
            className='impact-card'
            style={{ borderColor: getWarningColor() }}
        >
            <IonCardHeader>
                <IonCardTitle>Impact Factor</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <div
                    className='impact-warning'
                    style={{ backgroundColor: getWarningColor() }}
                >
                    <h2>{getWarningMessage()}</h2>
                </div>

                <div className='impact-stats'>
                    <div className='impact-stat'>
                        <span className='impact-label'>Budget Impact</span>
                        <span
                            className='impact-value'
                            style={{ color: getWarningColor() }}
                        >
                            {impact.percentageOfBudget.toFixed(1)}%
                        </span>
                    </div>

                    <div className='impact-divider'></div>

                    <div className='impact-stat'>
                        <span className='impact-label'>Remaining After</span>
                        <span className='impact-value'>
                            ${impact.remainingAfter.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className='impact-bar-container'>
                    <div
                        className='impact-bar'
                        style={{
                            width: `${Math.min(impact.percentageOfBudget, 100)}%`,
                            backgroundColor: getWarningColor(),
                        }}
                    />
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default ImpactDisplay;
