import React from "react";
import type { EventDetails } from "@/types/event";
import EventImage from "./EventImage";
import EventMeta from "./EventMeta";
import { Button } from "../ui/button";
import { Link } from "react-router";

type Props = {
  event: EventDetails;
};

const EventDetailsCard: React.FC<Props> = ({ event }) => {
  return (
    <article className="prose prose-lg max-w-none bg-white p-6 rounded-md shadow-sm">
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
          className="inline-block "
          target="_blank"
          rel="noreferrer"
        >
          <Link to={event.link} target="_blank" rel="noopener noreferrer">
            <Button>View original event</Button>
          </Link>
        </a>
      </div>
    </article>
  );
};

export default EventDetailsCard;
