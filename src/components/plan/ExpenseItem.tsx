// React import not required with new JSX runtime
import type { Expense } from "@/types/expense";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type Props = {
  expense: Expense;
  onDelete: ((id: string) => void) | null;
};

function ExpenseItem({ expense, onDelete }: Props) {
  return (
    <li className="flex items-center justify-between gap-4 py-3 border-b last:border-b-0">
      <div>
        <div className="text-sm font-medium">{expense.name ?? "Untitled"}</div>
      </div>

      <div className="flex items-center gap-3">
        <div className={cn("text-sm font-semibold")}>
          ${Number(expense.amount ?? 0).toFixed(2)}
        </div>
        {onDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(expense.id)}
        >
          Delete
        </Button>
        )}
      </div>
    </li>
  );
}

export default ExpenseItem;
