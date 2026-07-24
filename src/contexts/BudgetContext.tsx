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
import { useAuth } from "./AuthContext";
import axios from "axios";

interface BudgetContextType {
    budget: Budget;
    transactions: Transaction[];
    goal: Goal | null;
    addTransaction: (
        transaction: Omit<Transaction, "id" | "date">,
    ) => Promise<void>;
    calculateImpactFactor: (amount: number) => ImpactFactor;
    calculateOpportunityCost: (productPrice: number) => OpportunityCost;
    setGoal: (goal: Goal) => void;
    updateGoalProgress: (amount: number) => void;
    updateCategoryBudget: (categoryId: string, amount: number) => Promise<void>;
    addCategory: (
        name: string,
        budgetLimit: number,
        color?: string,
    ) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const defaultCategories: CategoryBudget[] = [
    { id: "1", name: "", allocated: 0, spent: 0, color: "#3b82f6" },
];

const calculateTotalBudget = (categories: CategoryBudget[]) =>
    categories.reduce((sum, category) => sum + (category.allocated || 0), 0);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { user } = useAuth();
    const [budget, setBudget] = useState<Budget>({
        id: "1",
        weeklyBudget: calculateTotalBudget(defaultCategories),
        spent: 0,
        remaining: calculateTotalBudget(defaultCategories),
        categories: defaultCategories,
    });

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goal, setGoalState] = useState<Goal | null>({
        id: "goal_1",
        name: "Tesla Cybertruck",
        modelName: "Tesla_Model_3",
        targetAmount: 45000,
        savedAmount: 13500,
        currency: "£",
    });

    // Cached asset prices (e.g. TSLA)
    const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});

    const DEFAULT_ASSET_PRICE = 250; // fallback if API fails

    const fetchAssetPrice = async (symbol: string) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL + "/api/stock";

            if (!apiUrl) {
                setAssetPrices((prev) => ({
                    ...prev,
                    [symbol]: DEFAULT_ASSET_PRICE,
                }));
                return DEFAULT_ASSET_PRICE;
            }

            // Using the /:symbol route from your backend
            const url = `${apiUrl}/${encodeURIComponent(symbol)}`;
            const resp = await axios.get(url);

            let price: number | undefined;

            // Parse the exact contract returned by your Express backend
            if (resp.data && resp.data.success && resp.data.data) {
                price = resp.data.data.currentPrice;
            }

            const finalPrice =
                price && !Number.isNaN(price) ? price : DEFAULT_ASSET_PRICE;

            setAssetPrices((prev) => ({ ...prev, [symbol]: finalPrice }));
            return finalPrice;
        } catch (error) {
            console.error("Error fetching asset price:", error);
            setAssetPrices((prev) => ({
                ...prev,
                [symbol]: DEFAULT_ASSET_PRICE,
            }));
            return DEFAULT_ASSET_PRICE;
        }
    };

    // Fetch categories from API when user is authenticated
    useEffect(() => {
        if (!user?.id) return;

        const fetchCategories = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/categories/user/${
                        user.id
                    }`,
                );

                const apiCategories = response.data;

                const categories: CategoryBudget[] = apiCategories.map(
                    (cat: any) => ({
                        id: cat._id,
                        name: cat.name,
                        allocated: cat.budgetLimit,
                        spent: cat.spent,
                        color: cat.color || "#6366f1",
                    }),
                );

                // Update budget with fetched categories
                setBudget((prevBudget) => ({
                    ...prevBudget,
                    categories:
                        categories.length > 0 ? categories : defaultCategories,
                    weeklyBudget: calculateTotalBudget(
                        categories.length > 0 ? categories : defaultCategories,
                    ),
                    remaining:
                        calculateTotalBudget(
                            categories.length > 0
                                ? categories
                                : defaultCategories,
                        ) - prevBudget.spent,
                }));
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, [user?.id]);

    // Fetch transactions from API when user is authenticated
    useEffect(() => {
        if (!user?.id) return;

        const fetchTransactions = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/transactions/user/${
                        user.id
                    }`,
                );

                const apiTransactions = response.data;

                const transactions: Transaction[] = apiTransactions.map(
                    (txn: any) => ({
                        id: txn._id,
                        name: txn.name,
                        amount: txn.amount,
                        category: txn.category,
                        barcode: txn.barcode,
                        date: new Date(txn.date),
                    }),
                );

                setTransactions(transactions);

                // Calculate total spent from transactions
                const totalSpent = transactions.reduce(
                    (sum, txn) => sum + txn.amount,
                    0,
                );

                // Update budget with actual spent amount
                setBudget((prevBudget) => ({
                    ...prevBudget,
                    spent: totalSpent,
                    remaining: prevBudget.weeklyBudget - totalSpent,
                }));
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };

        fetchTransactions();
    }, [user?.id]);

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

    const addTransaction = async (
        transaction: Omit<Transaction, "id" | "date">,
    ) => {
        try {
            if (!user?.id) throw new Error("User not authenticated");

            // Save to database
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/transactions`,
                {
                    ...transaction,
                    userId: user.id,
                    date: new Date(),
                },
            );

            const savedTransaction = response.data;

            // Create transaction object for local state
            const newTransaction: Transaction = {
                id: savedTransaction._id,
                name: savedTransaction.name,
                amount: savedTransaction.amount,
                category: savedTransaction.category,
                categoryId: transaction.categoryId,
                barcode: savedTransaction.barcode,
                date: new Date(savedTransaction.date),
            };

            setTransactions([newTransaction, ...transactions]);

            // Update budget
            const newSpent = budget.spent + transaction.amount;
            const newRemaining = budget.weeklyBudget - newSpent;

            // Update category spending in database and local state
            // Use categoryId if available, otherwise fall back to category name
            const categoryToUpdate = transaction.categoryId
                ? budget.categories.find(
                      (cat) => cat.id === transaction.categoryId,
                  )
                : budget.categories.find(
                      (cat) => cat.name === transaction.category,
                  );

            if (categoryToUpdate) {
                const newSpentAmount =
                    categoryToUpdate.spent + transaction.amount;

                // Update category in database
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/categories/${
                        categoryToUpdate.id
                    }`,
                    { spent: newSpentAmount },
                );

                // Update local state
                const updatedCategories = budget.categories.map((cat) => {
                    if (cat.id === categoryToUpdate.id) {
                        return { ...cat, spent: newSpentAmount };
                    }
                    return cat;
                });

                setBudget({
                    ...budget,
                    spent: newSpent,
                    remaining: newRemaining,
                    categories: updatedCategories,
                });
            } else {
                // If category not found, just update budget totals
                setBudget({
                    ...budget,
                    spent: newSpent,
                    remaining: newRemaining,
                });
            }
        } catch (error) {
            console.error("Error adding transaction:", error);
            if (axios.isAxiosError(error)) {
                console.error("Response:", error.response?.data);
            }
            throw error;
        }
    };

    const calculateImpactFactor = (amount: number): ImpactFactor => {
        const remaining = budget.remaining;
        // Guard against division by zero or negative remaining
        let percentageOfBudget: number;
        if (remaining <= 0) {
            percentageOfBudget = amount > 0 ? 100 : 0;
        } else {
            percentageOfBudget = (amount / remaining) * 100;
        }

        // Normalize NaN / infinite values
        if (!isFinite(percentageOfBudget) || Number.isNaN(percentageOfBudget)) {
            percentageOfBudget = amount > 0 ? 100 : 0;
        }

        const remainingAfter = remaining - amount;

        let warningLevel: "safe" | "caution" | "danger" = "safe";
        if (remaining <= 0) {
            warningLevel = "danger";
        } else if (percentageOfBudget > 50) {
            warningLevel = "danger";
        } else if (percentageOfBudget > 25) {
            warningLevel = "caution";
        }

        // Clamp percentage to reasonable range for UI
        percentageOfBudget = Math.max(0, Math.min(percentageOfBudget, 100));

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
        const symbol = "TSLA";
        const assetPrice = assetPrices[symbol] || DEFAULT_ASSET_PRICE;

        // If we don't have a fetched price yet, trigger background fetch
        if (!assetPrices[symbol]) {
            // fire-and-forget
            fetchAssetPrice(symbol).catch(() => {
                /* ignored */
            });
        }

        const equivalentUnits = assetPrice > 0 ? productPrice / assetPrice : 0;

        return {
            productPrice,
            assetName: "Tesla Shares",
            assetPrice,
            equivalentUnits: parseFloat(equivalentUnits.toFixed(2)),
        };
    };

    const setGoal = (newGoal: Goal) => {
        setGoalState(newGoal);
    };

    const updateGoalProgress = (amount: number) => {
        if (!goal) return;

        const newAmount = goal.savedAmount + amount;
        const progressPercentage = (newAmount / goal.targetAmount) * 100;

        setGoalState({
            ...goal,
            savedAmount: newAmount,
        });
    };

    const updateCategoryBudget = async (categoryId: string, amount: number) => {
        try {
            // Update in database
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/categories/${categoryId}`,
                { budgetLimit: amount },
            );

            // Update local state
            setBudget((prevBudget) => ({
                ...prevBudget,
                categories: prevBudget.categories.map((cat) =>
                    cat.id === categoryId ? { ...cat, allocated: amount } : cat,
                ),
                weeklyBudget: calculateTotalBudget(
                    prevBudget.categories.map((cat) =>
                        cat.id === categoryId
                            ? { ...cat, allocated: amount }
                            : cat,
                    ),
                ),
                remaining:
                    calculateTotalBudget(
                        prevBudget.categories.map((cat) =>
                            cat.id === categoryId
                                ? { ...cat, allocated: amount }
                                : cat,
                        ),
                    ) - prevBudget.spent,
            }));
        } catch (error) {
            console.error("Error updating category budget:", error);
            throw error;
        }
    };

    const addCategory = async (
        name: string,
        budgetLimit: number,
        color?: string,
    ) => {
        try {
            if (!user?.id) throw new Error("User not authenticated");

            // Create in database
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/categories`,
                {
                    name,
                    budgetLimit,
                    color: color || "#6366f1",
                    userId: user.id,
                    icon: "pricetag",
                },
            );

            // Add to local state
            const newCategory: CategoryBudget = {
                id: response.data._id,
                name: response.data.name,
                allocated: response.data.budgetLimit,
                spent: 0,
                color: response.data.color,
            };

            setBudget((prevBudget) => ({
                ...prevBudget,
                categories: [...prevBudget.categories, newCategory],
                weeklyBudget: calculateTotalBudget([
                    ...prevBudget.categories,
                    newCategory,
                ]),
                remaining:
                    calculateTotalBudget([
                        ...prevBudget.categories,
                        newCategory,
                    ]) - prevBudget.spent,
            }));
        } catch (error) {
            console.error("Error adding category:", error);
            if (axios.isAxiosError(error)) {
                console.error("Response:", error.response?.data);
                console.error("Request data:", {
                    name,
                    budgetLimit,
                    color,
                    userId: user?.id,
                });
            }
            throw error;
        }
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
                updateCategoryBudget,
                addCategory,
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
