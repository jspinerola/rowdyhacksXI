import type { Expense } from "@/types/expense";
import { useCallback } from "react";

// Adds a new expense to the list
export const handleAddExpense = useCallback(
  (
    setExpenses: (updater: (prev: Expense[]) => Expense[]) => void,
    name: string,
    amount: number
  ) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(), // Creates a random, unique ID
      name,
      amount,
    };

    console.log("Adding expense:", newExpense);
    // Add the new expense to the existing list using the provided setter
    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
  },
  [] // Empty dependency array means this function is created only once
);

// Removes an expense from the list by its ID
export const handleDeleteExpense = useCallback(
  (
    setExpenses: (updater: (prev: Expense[]) => Expense[]) => void,
    id: string
  ) => {
    setExpenses((prevExpenses) =>
      prevExpenses.filter((expense) => expense.id !== id)
    );
  },
  []
);
