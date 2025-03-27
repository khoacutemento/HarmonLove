import React from "react";

const LoadingDots = () => {
  return (
    <div className="flex gap-2">
      <div className="h-2 w-2 animate-pulse rounded-full bg-heading"></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-heading"></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-heading"></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-heading"></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-heading"></div>
    </div>
  );
};

export default LoadingDots;
