export type TransactionCategory =
  | "Income"
  | "Housing"
  | "Food"
  | "Transport"
  | "Utilities"
  | "Shopping"
  | "Health"
  | "Entertainment"
  | "Other";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  date: string;
  note?: string;
  source?: "manual" | "receipt";
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: "high" | "medium" | "low";
}

