import type { EventDetails } from "@/types/event";
import EventDetailsCard from "@/components/event/EventDetailsCard";
import { XMLParser } from "fast-xml-parser";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Event() {
  const { id } = useParams();

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
  }, [id]);

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
          <h3 className="font-semibold mb-3">Future Component Here</h3>
          <p className="text-sm text-gray-600">
            Placeholder section reserved for future interactive widgets or
            components (e.g., RSVP, map, schedule).
          </p>
        </aside>
      </div>
    </div>
  );
}

export default Event;
