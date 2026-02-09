import React from "react";
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
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonProgressBar,
    IonGrid,
    IonRow,
    IonCol,
} from "@ionic/react";
import { useBudget } from "../contexts/BudgetContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
    const { budget, transactions } = useBudget();

    const safeToSpend = budget.remaining;
    const spentPercentage = (budget.spent / budget.weeklyBudget) * 100;

    // Prepare chart data
    const chartData = budget.categories.map((cat) => ({
        name: cat.name,
        value: cat.spent || 0.1, // Minimum value for visibility
        color: cat.color,
    }));

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color='primary'>
                    <IonTitle>Aura Finance</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className='dashboard-content'>
                {/* Safe to Spend Card */}
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
                                <p>${budget.weeklyBudget.toFixed(2)}</p>
                            </div>
                        </div>
                    </IonCardContent>
                </IonCard>

                {/* Category Breakdown */}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Category Breakdown</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <ResponsiveContainer width='100%' height={200}>
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
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>

                        <IonList>
                            {budget.categories.map((category) => {
                                const percentage =
                                    (category.spent / category.allocated) * 100;
                                return (
                                    <IonItem key={category.id}>
                                        <IonLabel>
                                            <h2>{category.name}</h2>
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
