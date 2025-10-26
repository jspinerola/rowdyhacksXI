import type { EventDetails, EventPlans } from "@/types/event";
import EventDetailsCard from "@/components/event/EventDetailsCard";
import { XMLParser } from "fast-xml-parser";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import ExpenseItem from "@/components/plan/ExpenseItem";

function Event() {
  const { id } = useParams();

  const { profile } = useAuth();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          // fetch plan rows for this event
          const { data: planRows, error: planError } = await supabase
            .from("plan")
            .select("*")
            .eq("event_id", Number(id));

          if (planError) {
            console.error("Error fetching plan:", planError);
          }

          const plan =
            planRows && planRows.length > 0 ? planRows[0] : undefined;

          console.log("Fetched plan for event ID:", id, plan);

          let eventPlans: EventPlans | undefined = undefined;
          let organizationBalance: number | null = null;

          if (plan && plan.plan_id) {
            console.log("Found plan for event:", plan);
            // fetch expenses for the plan
            const { data: expensesData, error: expensesError } = await supabase
              .from("expenses")
              .select("*")
              .eq("plan_id", plan.plan_id);

            if (expensesError) {
              console.error("Error fetching expenses:", expensesError);
            }

            const expenses = expensesData ?? [];

            // fetch organization balance (try common field names)
            const orgId = profile?.organization_id;

            if (orgId != null) {
              const { data: orgData, error: orgError } = await supabase
                .from("organizations")
                .select("balance")
                .eq("id", orgId)
                .maybeSingle();

              if (orgError) {
                console.error("Error fetching organization:", orgError);
              }

              organizationBalance = orgData?.balance ?? null;
            }

            // calculate total expenses (assumes each expense has an `amount` field)
            const totalExpenses = expenses.reduce(
              (sum: number, e: any) => sum + (Number(e?.amount) || 0),
              0
            );

            const remainingBalance =
              organizationBalance !== null
                ? organizationBalance - totalExpenses
                : null;

            eventPlans = {
              budget: {
                organizationBalance,
                remainingBalance,
                expenses,
                totalExpenses,
              },
            };
          }

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
  }, [id, profile]);

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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Event details componentized */}
          <EventDetailsCard event={event} />
        </div>

        <aside className="md:col-span-1 bg-white border rounded-md p-4 shadow-sm">
          <div className="flex justify-between">
            {!event.eventPlans ? (
              <h3>No Plans Yet</h3>
            ) : (
              <>
                <h3>Plans</h3>
                <Link to={`/event/${event.id}/edit-event-plan`}>
                  <Button>Edit Event Plan</Button>
                </Link>
              </>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {!event.eventPlans ? (
              <>
                <p className="mb-4">Looks like no plan have been made yet...</p>
                <Link to={`/event/${event.id}/create-event-plan`}>
                  <Button>Create Event Plan</Button>
                </Link>
              </>
            ) : (
              <>
                <h4>Budget Details</h4>
                <p>
                  Total Expenses: $
                  {event.eventPlans.budget?.totalExpenses ?? "N/A"}
                </p>
                <ul className="divide-y divide-gray-200">
                  {event.eventPlans.budget?.expenses.map((expense) => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      onDelete={null}
                    />
                  ))}
                </ul>
                {}
              </>
            )}
          </p>
        </aside>
      </div>
    </div>
  );
}

export default Event;
