import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import AuctionService from "../../services/AuctionService";
const AuctionForm = ({ onCreated, token }) => {
  const [startingPrice, setStartingPrice] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      startingPrice: parseFloat(startingPrice),
      endTime,
    };
    try {
      const auction = await AuctionService.createAuction(payload, token);
      onCreated(auction);
    } catch (err) {
      console.error(err);
      alert("Failed to create auction");
    }
  };

  return (
    <Card className="max-w-md mx-auto mb-4">
      <CardContent className="p-6 space-y-4">
        <form onSubmit={handleSubmit}>
          <div>
            <Label>Starting Price</Label>
            <Input
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>End Time</Label>
            <Input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-4">
            Create Auction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuctionForm;
