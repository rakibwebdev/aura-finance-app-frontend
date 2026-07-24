import { registerPlugin } from "@capacitor/core";

export interface LatencyProbePayload {
    sentAt: number;
    sequence: number;
    payload: string;
}

export interface LatencyProbeResult {
    sequence: number;
    sentAt: number;
    receivedAt: number;
    processedAt: number;
    payloadBytes: number;
    parsedKeys: number;
}

export interface GoalARPlugin {
    startGoalAR(options: {
        model: string;
        progress: number;
        goalID: string; // ← add this
        anchorID?: string;
    }): Promise<{ anchorID: string }>;

    updateProgress(options: { progress: number }): Promise<void>;

    resetAnchor(options: {
        goalID: string; // ← add this
    }): Promise<void>;

    measureLatency(options: LatencyProbePayload): Promise<LatencyProbeResult>;
}

export const GoalAR = registerPlugin<GoalARPlugin>("GoalARPlugin");

export async function runGoalARLatencyBenchmark(
    iterations = 25,
    makePayload: (index: number) => Record<string, unknown> = (index) => ({
        index,
        transactionCoordinates: [
            { x: index, y: index + 1, z: index + 2 },
            { x: index + 3, y: index + 4, z: index + 5 },
        ],
        opportunityCosts: [{ productPrice: 12.34 + index, assetPrice: 250.12 }],
    }),
) {
    const results: LatencyProbeResult[] = [];

    for (let sequence = 0; sequence < iterations; sequence += 1) {
        const sentAt = Date.now();
        const payload = JSON.stringify(makePayload(sequence));

        const result = await GoalAR.measureLatency({
            sentAt,
            sequence,
            payload,
        });

        results.push(result);
    }

    const roundTrips = results.map(
        (result) => result.processedAt - result.sentAt,
    );
    const payloadLatencies = results.map(
        (result) => result.receivedAt - result.sentAt,
    );

    const average = (values: number[]) =>
        values.reduce((sum, value) => sum + value, 0) / values.length;

    const sortedRoundTrips = [...roundTrips].sort((a, b) => a - b);
    const percentile = (values: number[], rank: number) => {
        if (values.length === 0) return 0;
        const index = Math.min(
            values.length - 1,
            Math.max(0, Math.ceil(values.length * rank) - 1),
        );
        return values[index];
    };

    return {
        iterations,
        averagePayloadLatency: average(payloadLatencies),
        averageRoundTripLatency: average(roundTrips),
        peakRoundTripLatency: Math.max(...roundTrips),
        p95RoundTripLatency: percentile(sortedRoundTrips, 0.95),
        p99RoundTripLatency: percentile(sortedRoundTrips, 0.99),
        results,
    };
}
