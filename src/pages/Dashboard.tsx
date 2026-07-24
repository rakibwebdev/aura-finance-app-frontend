import React from "react";
import { useState } from "react";
import {
    IonPage,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonProgressBar,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    useIonToast,
    isPlatform,
} from "@ionic/react";
import { useBudget } from "../contexts/BudgetContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import PageHeader from "../components/PageHeader";
import { runGoalARLatencyBenchmark } from "../plugin/ARPlugin";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
    const { budget, transactions } = useBudget();
    const [presentToast] = useIonToast();
    const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);

    const totalBudget = budget.categories.reduce(
        (sum, category) => sum + (category.allocated || 0),
        0,
    );
    const safeToSpend = totalBudget - budget.spent;
    const spentPercentage =
        totalBudget > 0 ? (budget.spent / totalBudget) * 100 : 0;

    // Prepare chart data
    const chartData = budget.categories.map((cat) => ({
        name: cat.name,
        value: cat.spent || 0.1, // Minimum value for visibility
        color: cat.color,
    }));

    const handleRunLatencyBenchmark = async () => {
        if (!isPlatform("ios")) {
            await presentToast({
                message: "Latency benchmark is only available on iOS.",
                duration: 2000,
                color: "warning",
                position: "bottom",
            });
            return;
        }

        setIsRunningBenchmark(true);

        try {
            const result = await runGoalARLatencyBenchmark(25);

            console.log("GoalAR latency benchmark:", result);

            await presentToast({
                message: `Avg ${result.averageRoundTripLatency.toFixed(
                    2,
                )} ms | Peak ${result.peakRoundTripLatency.toFixed(2)} ms`,
                duration: 3500,
                color: "success",
                position: "bottom",
            });
        } catch (error) {
            console.error("Latency benchmark failed:", error);
            await presentToast({
                message: "Latency benchmark failed. Check the console.",
                duration: 2500,
                color: "danger",
                position: "bottom",
            });
        } finally {
            setIsRunningBenchmark(false);
        }
    };

    return (
        <IonPage>
            <PageHeader title='Aura Finance' />
            <IonContent fullscreen className='dashboard-content'>
                <IonCard className='safe-to-spend-card'>
                    <IonCardHeader>
                        <IonCardTitle>Weekly Pulse</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <div className='safe-amount'>
                            <h1>${safeToSpend.toFixed(2)}</h1>
                            <p>Safe to Spend</p>
                        </div>
                        <IonProgressBar
                            value={spentPercentage / 100}
                            color={
                                spentPercentage > 75
                                    ? "danger"
                                    : spentPercentage > 50
                                    ? "warning"
                                    : "success"
                            }
                        />
                        <div className='budget-stats'>
                            <div>
                                <small>Spent</small>
                                <p>${budget.spent.toFixed(2)}</p>
                            </div>
                            <div>
                                <small>Budget</small>
                                <p>${totalBudget.toFixed(2)}</p>
                            </div>
                        </div>
                    </IonCardContent>
                </IonCard>

                <IonCard className='benchmark-card'>
                    <IonCardHeader>
                        <IonCardTitle>Bridge Latency Test</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <p className='benchmark-copy'>
                            Run the native bridge benchmark to measure payload
                            latency and round-trip time.
                        </p>
                        <IonButton
                            expand='block'
                            onClick={handleRunLatencyBenchmark}
                            disabled={isRunningBenchmark}
                        >
                            {isRunningBenchmark
                                ? "Running Benchmark..."
                                : "Run Latency Benchmark"}
                        </IonButton>
                    </IonCardContent>
                </IonCard>

                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Category Breakdown</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <ResponsiveContainer width={"100%"} height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx='50%'
                                    cy='50%'
                                    labelLine={false}
                                    outerRadius={80}
                                    fill='#8884d8'
                                    dataKey='value'
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Pie>
                                <Legend
                                    formatter={(value) =>
                                        String(value).charAt(0).toUpperCase() +
                                        String(value).slice(1)
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <IonList>
                            {budget.categories.map((category) => {
                                const percentage = category.allocated
                                    ? (category.spent / category.allocated) *
                                      100
                                    : 0;
                                return (
                                    <IonItem key={category.id}>
                                        <IonLabel>
                                            <h2
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                {category.name}
                                            </h2>
                                            <p>
                                                ${category.spent.toFixed(2)} / $
                                                {category.allocated.toFixed(2)}
                                            </p>
                                        </IonLabel>
                                        <IonBadge
                                            color={
                                                percentage > 90
                                                    ? "danger"
                                                    : "primary"
                                            }
                                        >
                                            {percentage.toFixed(0)}%
                                        </IonBadge>
                                    </IonItem>
                                );
                            })}
                        </IonList>
                    </IonCardContent>
                </IonCard>

                {/* Recent Transactions */}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Recent Transactions</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        {transactions.length === 0 ? (
                            <p className='no-transactions'>
                                No transactions yet. Start scanning!
                            </p>
                        ) : (
                            <IonList>
                                {transactions.slice(0, 5).map((transaction) => (
                                    <IonItem key={transaction.id}>
                                        <IonLabel>
                                            <h2>{transaction.name}</h2>
                                            <p>{transaction.category}</p>
                                        </IonLabel>
                                        <IonBadge color='danger'>
                                            -${transaction.amount.toFixed(2)}
                                        </IonBadge>
                                    </IonItem>
                                ))}
                            </IonList>
                        )}
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default Dashboard;
