import React from "react";
import type { EventDetails } from "@/types/event";
import EventImage from "./EventImage";
import EventMeta from "./EventMeta";

type Props = {
  event: EventDetails;
};

const EventDetails: React.FC<Props> = ({ event }) => {
  return (
    <article className="prose prose-lg max-w-none">
      <div className="mb-6">
        <EventImage
          src={event.imageUrl}
          alt={event.title}
          className="h-64 object-cover"
        />
      </div>

      <h1 className="text-2xl font-semibold mb-2">{event.title}</h1>

      <EventMeta event={event} />

      <section className="mt-4">
        <h2 className="text-lg font-medium mb-2">Description</h2>
        <div
          className="text-base text-gray-800"
          dangerouslySetInnerHTML={{ __html: event.descriptionHtml }}
        />
      </section>

      <div className="mt-6">
        <a
          href={event.link}
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          target="_blank"
          rel="noreferrer"
        >
          View original event
        </a>
      </div>
    </article>
  );
};

export default EventDetails;
