import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { XMLParser } from "fast-xml-parser";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Budget from "@/components/plan/Budget";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/types/expense"; // Ensure this type is { id: string, name: string, amount: number }

function UpdateEventPlan() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();

  // State for data
  const [event, setEvent] = useState<any | null>(null);
  const [planId, setPlanId] = useState<number | null>(null); // Use number for the ID
  const [organizationBalance, setOrganizationBalance] = useState<number | null>(
    null
  );
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // State for deletions
  // This tracks DB (numeric) IDs that need to be deleted on save
  const [expenseIdsToDelete, setExpenseIdsToDelete] = useState<string[]>([]);

  // State for UI
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- 1. Data Fetching Effects ---

  // Effect 1: Fetch organization balance (depends only on profile)
  useEffect(() => {
    if (!profile?.organization_id) {
      console.warn("No organization_id available on profile.");
      return;
    }

    const fetchOrganizationBudget = async () => {
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("balance")
          .eq("id", Number(profile.organization_id))
          .single();

        if (error) throw error;

        if (data && data.balance != null) {
          const parsed = Number(data.balance);
          setOrganizationBalance(Number.isFinite(parsed) ? parsed : null);
          console.log("Fetched organization budget:", parsed);
        }
      } catch (err: any) {
        console.error("Error fetching organization budget:", err.message);
      }
    };

    fetchOrganizationBudget();
  }, [profile?.organization_id]);

  // Effect 2: Fetch Event (from XML) and Plan (from DB)
  useEffect(() => {
    // --- THIS IS THE FIX ---
    // Wait for BOTH the id and the profile's link to be available.
    if (!id) {
      setError("No event ID provided.");
      setLoading(false);
      return;
    }

    if (!profile?.organizations?.link) {
      // Profile is still loading, or link is missing.
      // This is not an error, just wait for the effect to re-run.
      console.log("Waiting for profile to fetch event link...");
      // Keep loading, but don't try to fetch
      setLoading(true);
      return;
    }
    setLoading(true);

    const fetchEventAndPlan = async () => {
      try {
        const response = await fetch(profile?.organizations?.link || "");
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

        console.log("Parsed XML:", parsed);

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

        if (!foundItem) {
          setError("Event not found in XML feed.");
          setLoading(false);
          return;
        }

        // 2. Fetch associated plan from Supabase
        // FIX: Use Number(id) to query the event_id
        const { data: planData, error: planError } = await supabase
          .from("plan")
          .select("plan_id") // Only select the ID you need
          .eq("event_id", Number(id))
          .maybeSingle();

        if (planError) throw planError;

        if (planData) {
          console.log("Fetched Plan:", planData);
          // FIX: Set plan_id as requested
          setPlanId(planData.plan_id);
        } else {
          console.warn("No plan found for this event in database.");
        }

        // 3. Set Event State
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
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndPlan();
  }, [id, profile]); // This effect only depends on the URL 'id'

  // Effect 3: Fetch expenses (depends only on planId)
  useEffect(() => {
    if (!planId) {
      setExpenses([]); // Clear expenses if there's no plan
      return;
    }

    const fetchExistingExpenses = async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("plan_id", Number(planId));

      if (error) {
        console.error("Error fetching existing expenses:", error);
      } else if (data) {
        setExpenses(
          data.map((expense) => ({
            id: String(expense.id), // Ensure ID is a string for local state
            name: expense.name,
            amount: expense.amount,
          }))
        );
      }
    };

    fetchExistingExpenses();
  }, [planId]); // This *only* runs when planId changes

  // --- 2. Event Handlers ---

  const handleAddExpense = useCallback((name: string, amount: number) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(), // Creates a temporary UUID
      name,
      amount,
    };
    console.log("Adding expense (local):", newExpense);
    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
  }, []);

  const handleDeleteExpense = useCallback((id: string) => {
    // Check if the ID is a numeric ID from the database
    const numericId = Number(id);
    const isExistingExpense = Number.isFinite(numericId) && !id.includes("-");

    if (isExistingExpense) {
      // Add this ID to the list of items to delete from the DB
      setExpenseIdsToDelete((prev) => [...prev, id]);
      console.log("Marked for deletion (DB):", id);
    } else {
      console.log("Removing (local):", id);
    }

    // Always filter the item from the local UI state
    setExpenses((prevExpenses) =>
      prevExpenses.filter((expense) => expense.id !== id)
    );
  }, []);

  const handleUpdatePlan = async () => {
    if (!planId) {
      setError("No plan ID available to associate expenses with.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create DELETE requests
      const deleteRequests = expenseIdsToDelete.map((id) =>
        supabase.from("expenses").delete().eq("id", Number(id))
      );
      console.log(`Preparing to delete ${deleteRequests.length} expenses.`);

      // 2. Create UPDATE and INSERT requests
      const upsertRequests = expenses.map((exp) => {
        const numericId = Number(exp.id);
        const isExisting = Number.isFinite(numericId) && !exp.id.includes("-");

        if (isExisting) {
          // UPDATE existing expense
          return supabase
            .from("expenses")
            .update({ name: exp.name, amount: exp.amount })
            .eq("id", numericId)
            .select();
        } else {
          // INSERT new expense
          return supabase
            .from("expenses")
            .insert({
              plan_id: Number(planId),
              name: exp.name,
              amount: exp.amount,
            })
            .select();
        }
      });
      console.log(`Preparing to upsert ${upsertRequests.length} expenses.`);

      // 3. Run all requests
      const allRequests = [...deleteRequests, ...upsertRequests];
      const results = await Promise.all(allRequests);

      // Check for any errors
      const firstError = results.find((r) => r.error)?.error;
      if (firstError) throw firstError;

      // 4. Update local state with new data from DB
      // Get the data from the upsert results (delete results are empty)
      const newExpensesData = results
        .slice(deleteRequests.length) // Skip the delete results
        .map((res) => (Array.isArray(res.data) ? res.data[0] : res.data))
        .filter(Boolean); // Filter out any nulls

      setExpenses(
        newExpensesData.map((exp) => ({
          id: String(exp.id),
          name: exp.name,
          amount: exp.amount,
        }))
      );

      // 5. Clear the deletion list
      setExpenseIdsToDelete([]);
      console.log("Expenses saved successfully.");
      const targetId = id ?? String(event.id);
      window.location.href = `/event/${targetId}`;
    } catch (err: any) {
      console.error("Error saving expenses:", err);
      setError(`Failed to save expenses: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Render Logic ---

  const remainingBalance =
    organizationBalance !== null
      ? organizationBalance -
        expenses.reduce(
          (total, expense) => total + (Number(expense.amount) || 0),
          0
        )
      : null;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!event) return <div>No event data available.</div>;

  return (
    <div>
      <h1>Update Plan: {event.title}</h1>
      <Budget
        organizationBalance={organizationBalance}
        remainingBalance={remainingBalance}
        expenses={expenses}
        handleAddExpense={handleAddExpense}
        handleDeleteExpense={handleDeleteExpense}
      />
      <Button onClick={handleUpdatePlan} disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}

export default UpdateEventPlan;
