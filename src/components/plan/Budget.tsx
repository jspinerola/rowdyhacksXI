import type { Expense } from "@/types/expense";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import ExpenseItem from "./ExpenseItem";
import AddExpenseForm from "./AddExpenseForm";

function Budget({
  organizationBalance,
  remainingBalance,
  expenses,
  handleAddExpense,
  handleDeleteExpense,
}: {
  organizationBalance: number | null;
  remainingBalance: number | null;
  expenses: Expense[];
  handleAddExpense: (
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>,
    name: string,
    amount: number
  ) => void;
  handleDeleteExpense: (
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>,
    id: string
  ) => void;
}) {
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Budget</CardTitle>
        <CardDescription>
          Track expenses and manage your organization's balance.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          {organizationBalance !== null ? (
            <div className="text-lg font-semibold">
              Organization Balance: ${organizationBalance.toFixed(2)}
            </div>
          ) : (
            <div>Loading organization balance...</div>
          )}
        </div>
        <ul className="divide-y">
          {expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onDelete={handleDeleteExpense}
            />
          ))}
        </ul>
        <strong className="text-red-800">
          Total Expenses: $
          {expenses
            .reduce((total, expense) => total + expense.amount, 0)
            .toFixed(2)}
        </strong>{" "}
        <br />
        <strong
          className={
            organizationBalance === null
              ? "text-gray-800"
              : remainingBalance! > 0
              ? "text-green-800"
              : remainingBalance! < 0
              ? "text-red-800"
              : "text-gray-800"
          }
        >
          Remaining Balance: $
          {organizationBalance !== null
            ? remainingBalance!.toFixed(2)
            : "Loading..."}
        </strong>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <AddExpenseForm onAddExpense={handleAddExpense} />
      </CardFooter>
    </Card>
  );
}

export default Budget;
