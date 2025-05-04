import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";

const AuctionModal = ({ onAuctionCreated }) => {
  const [auctionData, setAuctionData] = useState({
    title: "",
    startingPrice: 0,
    startTime: "",
    endTime: "",
  });

  const handleChange = (e) => {
    setAuctionData({ ...auctionData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auctions/add", auctionData);
      onAuctionCreated(res.data); // Callback to parent
    } catch (err) {
      console.error("Auction creation failed", err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Create Auction</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Auction</DialogTitle>
          <DialogDescription>
            Provide details for your auction. Fill in the title, pricing,
            timings, status, and description.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            placeholder="Auction Title"
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="startingPrice"
            type="number"
            placeholder="Starting Price"
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <div className="starttime">
            <label htmlFor="start time"> Start time</label>
            <input
              name="startTime"
              type="datetime-local"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="starttime">
            <label htmlFor="start time"> End time</label>
            <input
              name="endTime"
              type="datetime-local"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuctionModal;
