import React from "react";
import type { EventDetails } from "@/types/event";

type Props = {
  event: Partial<EventDetails>;
};

const EventMeta: React.FC<Props> = ({ event }) => {
  const start = event.startDate
    ? new Date(event.startDate).toLocaleString()
    : "TBA";
  const end = event.endDate ? new Date(event.endDate).toLocaleString() : "TBA";

  return (
    <div className="mt-4 text-sm text-gray-700 space-y-2">
      <div>
        <strong>When:</strong> {start} - {end}
      </div>
      <div>
        <strong>Where:</strong> {event.location ?? "TBA"}
      </div>
      <div>
        <strong>Host:</strong> {event.host ?? "—"}
      </div>
      {event.link && (
        <div>
          <a href={event.link} className="text-blue-600 hover:underline">
            Event link
          </a>
        </div>
      )}
    </div>
  );
};

export default EventMeta;
