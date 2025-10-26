import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { cn } from "@/lib/utils";

interface AddExpenseFormProps {
  onAddExpense: (name: string, amount: number) => void;
}

function AddExpenseForm({ onAddExpense }: AddExpenseFormProps) {
  // This state controls whether to show the button or the form
  const [isAdding, setIsAdding] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    if (name && !isNaN(numericAmount)) {
      onAddExpense(name, numericAmount);
      setName("");
      setAmount("");
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <Button variant="secondary" onClick={() => setIsAdding(true)}>
        Add Expense
      </Button>
    );
  }

  return (
    <Card className="mt-2">
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm font-medium">Expense Name</span>
              <input
                className={cn(
                  "mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
                )}
                type="text"
                placeholder="Coffee, Printer ink, Venue"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">Amount (USD)</span>
              <input
                className={cn(
                  "mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
                )}
                type="number"
                placeholder="0.00"
                value={amount as number | ""}
                onChange={(e) =>
                  setAmount(
                    e.target.value === "" ? "" : parseFloat(e.target.value)
                  )
                }
                required
                step="0.01"
                min="0"
              />
            </label>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button type="submit">Add expense</Button>
            <Button
              variant="ghost"
              onClick={() => setIsAdding(false)}
              type="button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter />
    </Card>
  );
}

export default AddExpenseForm;
