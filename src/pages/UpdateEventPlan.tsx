import Budget from "@/components/plan/Budget";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

function UpdateEventPlan() {
  const { id } = useParams();

  const [organizationBalance, setOrganizationBalance] = useState<number | null>(
    null
  );
  const [expenses, setExpenses] = useState<Array<{ id: string; name: string; amount: number }>>([]);

  const remainingBalance = organizationBalance !== null ? organizationBalance - expenses.reduce((total, expense) => total + expense.amount, 0) : null;



  return (
    <div>
      <h1>Update Event Plan for Event ID: {id}</h1>
      <Budget
        organizationBalance={organizationBalance}
        remainingBalance={remainingBalance}
        expenses={expenses}
        handleAddExpense={handleAddExpense}
        handleDeleteExpense={handleDeleteExpense}
      />
      <Button>Update Plan</Button>
    </div>
  );
}

export default UpdateEventPlan;
