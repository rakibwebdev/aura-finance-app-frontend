import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import {
    Budget,
    CategoryBudget,
    Transaction,
    Goal,
    ImpactFactor,
    OpportunityCost,
} from "../types";

interface BudgetContextType {
    budget: Budget;
    transactions: Transaction[];
    goal: Goal | null;
    addTransaction: (transaction: Omit<Transaction, "id" | "date">) => void;
    calculateImpactFactor: (amount: number) => ImpactFactor;
    calculateOpportunityCost: (productPrice: number) => OpportunityCost;
    setGoal: (goal: Goal) => void;
    updateGoalProgress: (amount: number) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const defaultCategories: CategoryBudget[] = [
    { id: "1", name: "Groceries", allocated: 200, spent: 0, color: "#3b82f6" },
    { id: "2", name: "Tech", allocated: 150, spent: 0, color: "#8b5cf6" },
    {
        id: "3",
        name: "Entertainment",
        allocated: 100,
        spent: 0,
        color: "#ec4899",
    },
    { id: "4", name: "Other", allocated: 50, spent: 0, color: "#f59e0b" },
];

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [budget, setBudget] = useState<Budget>({
        id: "1",
        weeklyBudget: 500,
        spent: 0,
        remaining: 500,
        categories: defaultCategories,
    });

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goal, setGoalState] = useState<Goal | null>({
        id: "1",
        name: "Tesla Cybertruck",
        targetAmount: 60000,
        currentAmount: 0,
        modelType: "3d-object",
        progressStage: "wireframe",
    });

    // Load from local storage
    useEffect(() => {
        const savedBudget = localStorage.getItem("aura-budget");
        const savedTransactions = localStorage.getItem("aura-transactions");
        const savedGoal = localStorage.getItem("aura-goal");

        if (savedBudget) setBudget(JSON.parse(savedBudget));
        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
        if (savedGoal) setGoalState(JSON.parse(savedGoal));
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem("aura-budget", JSON.stringify(budget));
    }, [budget]);

    useEffect(() => {
        localStorage.setItem("aura-transactions", JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        if (goal) {
            localStorage.setItem("aura-goal", JSON.stringify(goal));
        }
    }, [goal]);

    const addTransaction = (transaction: Omit<Transaction, "id" | "date">) => {
        const newTransaction: Transaction = {
            ...transaction,
            id: Date.now().toString(),
            date: new Date(),
        };

        setTransactions([newTransaction, ...transactions]);

        // Update budget
        const newSpent = budget.spent + transaction.amount;
        const newRemaining = budget.weeklyBudget - newSpent;

        // Update category spending
        const updatedCategories = budget.categories.map((cat) => {
            if (cat.name === transaction.category) {
                return { ...cat, spent: cat.spent + transaction.amount };
            }
            return cat;
        });

        setBudget({
            ...budget,
            spent: newSpent,
            remaining: newRemaining,
            categories: updatedCategories,
        });
    };

    const calculateImpactFactor = (amount: number): ImpactFactor => {
        const percentageOfBudget = (amount / budget.remaining) * 100;
        const remainingAfter = budget.remaining - amount;

        let warningLevel: "safe" | "caution" | "danger" = "safe";
        if (percentageOfBudget > 50) {
            warningLevel = "danger";
        } else if (percentageOfBudget > 25) {
            warningLevel = "caution";
        }

        return {
            amount,
            percentageOfBudget,
            remainingAfter,
            warningLevel,
        };
    };

    const calculateOpportunityCost = (
        productPrice: number,
    ): OpportunityCost => {
        // Default asset: Tesla stock at ~$250
        const teslaStockPrice = 250;
        const equivalentUnits = productPrice / teslaStockPrice;

        return {
            productPrice,
            assetName: "Tesla Shares",
            assetPrice: teslaStockPrice,
            equivalentUnits: parseFloat(equivalentUnits.toFixed(2)),
        };
    };

    const setGoal = (newGoal: Goal) => {
        setGoalState(newGoal);
    };

    const updateGoalProgress = (amount: number) => {
        if (!goal) return;

        const newAmount = goal.currentAmount + amount;
        const progressPercentage = (newAmount / goal.targetAmount) * 100;

        let progressStage: "wireframe" | "partial" | "complete" = "wireframe";
        if (progressPercentage >= 100) {
            progressStage = "complete";
        } else if (progressPercentage >= 26) {
            progressStage = "partial";
        }

        setGoalState({
            ...goal,
            currentAmount: newAmount,
            progressStage,
        });
    };

    return (
        <BudgetContext.Provider
            value={{
                budget,
                transactions,
                goal,
                addTransaction,
                calculateImpactFactor,
                calculateOpportunityCost,
                setGoal,
                updateGoalProgress,
            }}
        >
            {children}
        </BudgetContext.Provider>
    );
};

export const useBudget = () => {
    const context = useContext(BudgetContext);
    if (context === undefined) {
        throw new Error("useBudget must be used within a BudgetProvider");
    }
    return context;
};
