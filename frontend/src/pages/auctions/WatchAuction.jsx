// src/pages/WatchAuction.jsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const WatchAuction = () => {
  const { id } = useParams();

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:7107/auction/${id}/watch`);

    ws.onopen = () => {
      console.log("Connected to WebSocket auction watcher.");
    };

    ws.onmessage = (event) => {
      console.log("New auction data:", event.data);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    return () => {
      ws.close();
    };
  }, [id]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Watching Auction #{id}</h2>
      <p className="text-gray-600">Live bid updates will appear here.</p>
      {/* Add any UI for real-time updates */}
    </div>
  );
};

export default WatchAuction;
