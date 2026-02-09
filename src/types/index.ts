export interface Budget {
    id: string;
    weeklyBudget: number;
    spent: number;
    remaining: number;
    categories: CategoryBudget[];
}

export interface CategoryBudget {
    id: string;
    name: string;
    allocated: number;
    spent: number;
    color: string;
}

export interface Transaction {
    id: string;
    name: string;
    amount: number;
    category: string;
    date: Date;
    barcode?: string;
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    modelType: "3d-object";
    assetUrl?: string;
    progressStage: "wireframe" | "partial" | "complete";
}

export interface Product {
    barcode: string;
    name: string;
    price: number;
    category: string;
}

export interface ImpactFactor {
    amount: number;
    percentageOfBudget: number;
    remainingAfter: number;
    warningLevel: "safe" | "caution" | "danger";
}

export interface OpportunityCost {
    productPrice: number;
    assetName: string;
    assetPrice: number;
    equivalentUnits: number;
}
