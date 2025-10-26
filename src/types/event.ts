import type { Expense } from "./expense";

export interface EventDetails {
  id: string; // from <guid>
  title: string;
  link: string;
  host: string;
  location: string;
  descriptionHtml: string; // The raw HTML from <description>
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  eventPlans?: EventPlans;
}

export interface EventPlans {
  budget?: Budget;
  // add itinierary and other fields as needed
}

export interface Budget {
  organizationBalance: number | null;
  remainingBalance: number | null;
  expenses: Expense[];
  totalExpenses: number;
}
