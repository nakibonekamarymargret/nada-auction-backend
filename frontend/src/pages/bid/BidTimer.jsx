import React, { useEffect, useState } from "react";

const BidTimer = ({ initialSecondsLeft }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft || 0);

  useEffect(() => {
    if (!initialSecondsLeft || initialSecondsLeft <= 0) {
      setSecondsLeft(0);
      return;
    }

    setSecondsLeft(initialSecondsLeft); // Set initial time

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialSecondsLeft]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="w-90 bg-gray-800 text-white rounded-full py-3 px-6 text-xl font-tenor flex items-center justify-center gap-1 mb-2">
        <span>⏳ Last Chance to Bid:</span>
        <span className="text-yellow-400">{formatTime(secondsLeft)}</span>
      </div>
    </div>
  );
};

export default BidTimer;
