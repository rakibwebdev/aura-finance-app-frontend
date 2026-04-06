import { registerPlugin } from "@capacitor/core";

export interface GoalARPlugin {
    startGoalAR(options: {
        model: string;
        progress: number;
        goalID: string; // ← add this
    }): Promise<{ anchorID: string }>;

    updateProgress(options: { progress: number }): Promise<void>;

    resetAnchor(options: {
        goalID: string; // ← add this
    }): Promise<void>;
}

export const GoalAR = registerPlugin<GoalARPlugin>("GoalARPlugin");
