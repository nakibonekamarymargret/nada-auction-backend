import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";

const BidTimer = forwardRef(({ auctionStart }, ref) => {
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useImperativeHandle(ref, () => ({
    resetTimer() {
      setSecondsLeft(30);
    },
  }));

  const hours = Math.floor(secondsLeft / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((secondsLeft % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <div className="flex justify-center">
        <div className="  w-90 bg-gray-800 text-white rounded-full py-3 text-xl font-mono flex items-center justify-center gap-1">
          <span>{auctionStart}</span>:<span>{hours}</span>:
          <span>{minutes}</span>:<span>{seconds}</span>
      </div>
    </div>
  );
});

export default BidTimer;
