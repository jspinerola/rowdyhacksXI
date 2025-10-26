import type { EventDetails } from "@/types/event";
import React, { useEffect, useState } from "react";
import { XMLParser } from "fast-xml-parser";
import { Card, CardAction, CardTitle } from "./ui/card";
import { Link } from "react-router";

function Events({ organizationLink }: { organizationLink?: string }) {
  console.log("Events props:", { organizationLink });

  const [xml, setXml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventDetails[]>([]);

  const fetchXml = async (): Promise<string> => {
    if (!organizationLink) {
      throw new Error("No organizationLink provided");
    }
    const response = await fetch(organizationLink);
    if (!response.ok) {
      throw new Error("Failed to fetch XML");
    }
    return await response.text();
  };

  useEffect(() => {
    const getXml = async () => {
      if (!organizationLink) {
        setError("No organizationLink provided");
        setLoading(false);
        return;
      }

      try {
        const fetchedXml = await fetchXml();
        setXml(fetchedXml);
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "",
          removeNSPrefix: true,
        });
        const parsed = parser.parse(fetchedXml);

        const items = parsed.rss?.channel?.item;
        const itemsArray = items
          ? Array.isArray(items)
            ? items
            : [items]
          : [];
        const parsedEvents: EventDetails[] = itemsArray.map((item: any) => {
          const guidStr = String(item.guid ?? "");
          const idMatch = guidStr.match(/(\d+)$/);
          const id = idMatch ? idMatch[1] : guidStr;

          return {
            id,
            imageUrl: item.enclosure?.url || "",
            title: item.title,
            link: item.link,
            host: item.host,
            location: item.location,
            descriptionHtml: item.description,
            startDate: new Date(item.start),
            endDate: new Date(item.end),
          };
        });
        setEvents(parsedEvents);
        console.log("Parsed events:", parsedEvents);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (organizationLink) {
      getXml();
    } else {
      // If there's no link, don't just hang; set loading to false.
      setLoading(false);
      setEvents([]); // Clear any old events
    }
  }, [organizationLink]); // re-run when organizationLink changes

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card key={event.id} className="p-4 w-full">
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-40 object-cover mb-2"
              />
            )}
            <CardTitle>{event.title}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Link to={event.link} target="_blank" rel="noopener noreferrer">
                <CardAction>View JagSync</CardAction>
              </Link>
              <Link to={"/event/" + event.id}>
                <CardAction>View Details</CardAction>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Events;
