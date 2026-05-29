import React, { useEffect, useState } from "react";
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonProgressBar,
    IonBadge,
    IonIcon,
    isPlatform,
} from "@ionic/react";
import { eyeOutline, refreshOutline, trashOutline } from "ionicons/icons";
import { Preferences } from "@capacitor/preferences";

import { GoalAR } from "../plugin/ARPlugin";
import { Storage } from "../utils/storage";

interface Goal {
    id: string;
    name: string;
    modelName: string;
    targetAmount: number;
    savedAmount: number;
    currency: string;
}

const DreamVisualizer: React.FC<{ goal: Goal }> = ({ goal }) => {
    const [anchorID, setAnchorID] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPlaced, setIsPlaced] = useState(false);

    const progress = goal.savedAmount / goal.targetAmount;
    const percent = Math.round(progress * 100);

    // Load saved anchorID on mount
    useEffect(() => {
        Storage.get(`anchorID_${goal.id}`).then((value) => {
            if (value) {
                setAnchorID(value);
                setIsPlaced(true);
            }
        });
    }, [goal.id]);

    // Sync progress to AR whenever savings change
    useEffect(() => {
        if (!isPlaced) return;
        GoalAR.updateProgress({ progress }).catch((err) =>
            console.warn("AR sync failed:", err),
        );
    }, [goal.savedAmount, isPlaced]);

    const handleOpenAR = async () => {
        if (!isPlatform("ios")) {
            setError("AR is only available on iOS devices.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await GoalAR.startGoalAR({
                model: goal.modelName,
                progress: progress,
                goalID: goal.id, // ← each goal gets its own world map
            });

            // Persist the anchor ID
            await Storage.set(`anchorID_${goal.id}`, result.anchorID);

            setAnchorID(result.anchorID);
            setIsPlaced(true);
        } catch (err: any) {
            setError("Could not start AR. Check camera permissions.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Let the user reposition their goal
    const handleReset = async () => {
        await GoalAR.resetAnchor({ goalID: goal.id });
        await Storage.remove(`anchorID_${goal.id}`);
        setAnchorID(null);
        setIsPlaced(false);
    };

    return (
        <IonCard>
            <IonCardContent>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                    }}
                >
                    <h2 style={{ margin: 0, fontWeight: 600 }}>{goal.name}</h2>
                    <IonBadge
                        color={
                            percent >= 100
                                ? "success"
                                : percent >= 60
                                ? "primary"
                                : percent >= 30
                                ? "warning"
                                : "medium"
                        }
                    >
                        {percent}%
                    </IonBadge>
                </div>

                <p
                    style={{
                        color: "var(--ion-color-medium)",
                        marginBottom: 4,
                    }}
                >
                    {goal.currency}
                    {/* {goal.savedAmount.toLocaleString()} of {goal.currency}
                    {goal.targetAmount.toLocaleString()} */}
                </p>

                <IonProgressBar
                    value={progress}
                    color={progress >= 1 ? "success" : "primary"}
                    style={{ borderRadius: 8, height: 8, marginBottom: 16 }}
                />

                <p
                    style={{
                        fontSize: 13,
                        color: "var(--ion-color-medium)",
                        marginBottom: 16,
                    }}
                >
                    {getStageLabel(percent)}
                </p>

                {/* Main AR button */}
                <IonButton
                    expand='block'
                    onClick={handleOpenAR}
                    disabled={isLoading}
                >
                    <IonIcon slot='start' icon={eyeOutline} />
                    {isLoading
                        ? "Opening..."
                        : isPlaced
                        ? "View in Your Space"
                        : "Place in Your Space"}
                </IonButton>

                {/* Shown only after object is placed */}
                {isPlaced && (
                    <>
                        <IonButton
                            expand='block'
                            fill='outline'
                            onClick={() => GoalAR.updateProgress({ progress })}
                            style={{ marginTop: 8 }}
                        >
                            <IonIcon slot='start' icon={refreshOutline} />
                            Sync Progress to AR
                        </IonButton>

                        <IonButton
                            expand='block'
                            fill='clear'
                            color='medium'
                            onClick={handleReset}
                            style={{ marginTop: 4 }}
                        >
                            <IonIcon slot='start' icon={trashOutline} />
                            Reposition Goal
                        </IonButton>

                        <p
                            style={{
                                fontSize: 12,
                                color: "var(--ion-color-success)",
                                marginTop: 8,
                                textAlign: "center",
                            }}
                        >
                            Saved — appears in the same spot every time
                        </p>
                    </>
                )}

                {error && (
                    <p
                        style={{
                            color: "var(--ion-color-danger)",
                            fontSize: 13,
                            marginTop: 8,
                        }}
                    >
                        {error}
                    </p>
                )}
            </IonCardContent>
        </IonCard>
    );
};

function getStageLabel(percent: number): string {
    if (percent >= 100) return "Goal complete — your dream is real!";
    if (percent >= 70) return "Almost there — solid and vivid in AR";
    if (percent >= 30) return "Taking shape — becoming solid";
    return "Ghost stage — keep saving to build it up";
}

export default DreamVisualizer;
