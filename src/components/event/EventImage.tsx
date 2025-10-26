import React from "react";

type Props = {
  src?: string;
  alt?: string;
  className?: string;
};

const EventImage: React.FC<Props> = ({
  src,
  alt = "Event image",
  className = "",
}) => {
  if (!src) {
    return (
      <div
        className={`bg-gray-100 text-gray-400 flex items-center justify-center ${className} rounded-md border border-dashed`}
        style={{ minHeight: 200 }}
      >
        No image
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full rounded-md shadow-sm ${className}`}
    />
  );
};

export default EventImage;
