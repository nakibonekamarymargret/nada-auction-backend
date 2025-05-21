import React, { useEffect, useState, useImperativeHandle, forwardRef,useCallback } from "react";

const BidTimer = forwardRef(({ lastBidTime }, ref) => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  const resetTimer = useCallback((lastBidTime) => {
    if (!lastBidTime) return;
    const lastBid = new Date(lastBidTime);
    const now = new Date();
    const diffInSeconds = Math.floor((now - lastBid) / 1000);
    const timeLeft = Math.max(30 - diffInSeconds, 0); // 30 seconds timeout
    setSecondsLeft(timeLeft);
  }, []);

  useEffect(() => {
    resetTimer(lastBidTime);
  }, [lastBidTime, resetTimer]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) clearInterval(interval);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  useImperativeHandle(ref, () => ({
    resetTimer: () => resetTimer(lastBidTime),
  }));

  const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(
      2,
      "0"
  )}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
      <div className="text-center">
        <p className="text-lg font-semibold text-red-500">Next Bid Due In:</p>
        <div className="mt-2 text-xl font-mono text-gray-800">{formattedTime}</div>
      </div>
  );
});

export default BidTimer;