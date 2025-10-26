import Budget from "@/components/plan/Budget";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { handleAddExpense, handleDeleteExpense } from "@/lib/budget";
import { supabase } from "@/lib/supabase";
import type { EventDetails } from "@/types/event";
import type { Expense } from "@/types/expense";
import { XMLParser } from "fast-xml-parser";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

function CreateEventPlan() {
  const { id } = useParams();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationBalance, setOrganizationBalance] = useState<number | null>(
    null
  );
  // here we can add gemini api to generate initial expense ideas based on event details
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  const remainingBalance =
    organizationBalance !== null ? organizationBalance - totalExpenses : null;



  const { profile } = useAuth();

  const handleSubmitPlan = async () => {
    // Logic to submit the event plan
    try {
      if (!event) {
        setError("No event available to create a plan for.");
        return;
      }

      // 1) create a new plan row for this event
      const { data: planData, error: planError } = await supabase
        .from("plan")
        .insert({ event_id: Number(event.id) })
        .select()
        .single();

      if (planError || !planData) {
        console.error("Failed to create plan:", planError);
        setError("Failed to create plan.");
        return;
      }

      // support different possible id column names returned by your DB
      const planId: number | string | undefined =
        (planData as any).id ??
        (planData as any).planid ??
        (planData as any).plan_id;

      if (!planId) {
        console.error("Created plan did not return an id:", planData);
        setError("Created plan did not return an id.");
        return;
      }

      // 2) insert all expenses referencing the created plan id
      if (expenses.length === 0) {
        console.log("No expenses to insert for plan", planId);
      } else {
        const expenseRows = expenses.map((e) => ({
          plan_id: planId,
          name: e.name,
          amount: e.amount,
        }));

        const { data: insertedExpenses, error: expensesError } = await supabase
          .from("expenses")
          .insert(expenseRows);

        if (expensesError) {
          console.error("Failed to insert expenses:", expensesError);
          setError("Failed to insert expenses.");
          return;
        }

        console.log("Inserted expenses:", insertedExpenses);
      }

      // optionally provide feedback / navigate / refresh UI
      console.log("Plan created successfully:", planData);

      // navigate back to the event page once complete
      const targetId = id ?? String(event.id);
      window.location.href = `/event/${targetId}`;
    } catch (err) {
      console.error("Unexpected error creating plan and expenses:", err);
      setError("Unexpected error creating plan.");
    }
  };

  useEffect(() => {
    const fetchOrganizationBudget = async () => {
      try {
        console.log("CreateEventPlan profile IDDDD:", profile?.organization_id);

        let orgRow: any = null;
        let error: any = null;
        if (!profile?.organization_id) {
          console.warn("No organization_id available on profile.");
        } else {
          const res = await supabase
            .from("organizations")
            .select("balance")
            .eq("id", Number(profile.organization_id))
            .single();
          orgRow = res.data;
          error = res.error;
        }

        if (error) {
          console.error("Error fetching organization budget:", error);
          return;
        }

        if (orgRow && orgRow.balance != null) {
          const parsed = Number(orgRow.balance);
          setOrganizationBalance(Number.isFinite(parsed) ? parsed : null);
          console.log("Fetched organization budget:", parsed);
        }
      } catch (err) {
        console.error("Unexpected error fetching org budget:", err);
      }
    };

    fetchOrganizationBudget();

    if (!id) {
      setError("No event ID provided.");
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      // get xml data
      try {
        const response = await fetch(
          "https://jagsync.tamusa.edu/organization/acm/events.rss"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch XML");
        }

        const xmlText = await response.text();
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "",
          removeNSPrefix: true,
        });
        const parsed = parser.parse(xmlText);

        const rawItems = parsed.rss.channel.item;
        const itemsArray = rawItems
          ? Array.isArray(rawItems)
            ? rawItems
            : [rawItems]
          : [];

        const foundItem = itemsArray.find((item: any) => {
          const guidStr = String(item.guid ?? "");
          const idMatch = guidStr.match(/(\d+)$/);
          const itemId = idMatch ? idMatch[1] : guidStr;
          return itemId === id;
        });

        if (foundItem) {
          // make call to supabase to get associated budget data
          const { data: EventPlans } = await supabase
            .from("plan")
            .select("*")
            .eq("event_id", id);

          if (EventPlans) {
            console.log("Fetched EventPlans:", EventPlans[0]);
          }

          const eventPlans =
            EventPlans && EventPlans.length > 0 ? EventPlans[0] : undefined;

          const guidStr = String(foundItem.guid ?? "");
          const idMatch = guidStr.match(/(\d+)$/);
          const eventId = idMatch ? idMatch[1] : guidStr;

          setEvent({
            id: eventId,
            imageUrl: foundItem.enclosure?.url || "",
            title: foundItem.title,
            link: foundItem.link,
            host: foundItem.host,
            location: foundItem.location,
            descriptionHtml: foundItem.description,
            startDate: new Date(foundItem.start),
            endDate: new Date(foundItem.end),
            eventPlans: eventPlans,
          });
        } else {
          setError("Event not found.");
        }
      } catch (error) {
        setError("An error occurred while fetching the event.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, profile?.organization_id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!event) {
    return <div>No event data available.</div>;
  }
  return (
    <>
      <h1>Let's plan {event.title}</h1>

      <Budget
        organizationBalance={organizationBalance}
        remainingBalance={remainingBalance}
        expenses={expenses}
        handleAddExpense={handleAddExpense}
        handleDeleteExpense={handleDeleteExpense}
      />

      <Button
        onClick={handleSubmitPlan}
        disabled={expenses.length === 0}
        title={
          expenses.length === 0
            ? "Add at least one expense to submit the plan"
            : undefined
        }
      >
        Submit Plan
      </Button>
    </>
  );
}

export default CreateEventPlan;
