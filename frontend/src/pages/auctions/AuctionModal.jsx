import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AuctionService from "../../services/AuctionService";

const AuctionModal = ({ onAuctionCreated }) => {
  const [auctionData, setAuctionData] = useState({
    title: "",
    startingPrice: "",
    startTime: "",
    endTime: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAuctionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!auctionData.title.trim()) {
      setError("Title is required.");
      return false;
    }
    if (isNaN(auctionData.startingPrice) || auctionData.startingPrice <= 0) {
      setError("Starting price must be a positive number.");
      return false;
    }
    if (!auctionData.startTime) {
      setError("Start time is required.");
      return false;
    }
    if (!auctionData.endTime) {
      setError("End time is required.");
      return false;
    }
    if (new Date(auctionData.startTime) >= new Date(auctionData.endTime)) {
      setError("End time must be after start time.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // Debugging: Log token and data
      console.log("Token:", token);
      console.log("Auction Data:", auctionData);

      if (!token) {
        throw new Error("No authentication token found.");
      }

      const res = await AuctionService.add(auctionData, token);

      onAuctionCreated(res.data);
      setAuctionData({
        title: "",
        startingPrice: "",
        startTime: "",
        endTime: "",
      });
    } catch (err) {
      console.error("Auction creation failed", err);
      setError(
        err.response?.data?.message ||
          "Failed to create auction. Please check your connection or permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Create Auction</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Auction</DialogTitle>
            <DialogDescription>
              Fill out the details below to create a new auction.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={auctionData.title}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Enter auction title"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startingPrice" className="text-right">
                Starting Price
              </Label>
              <Input
                id="startingPrice"
                name="startingPrice"
                type="number"
                step="0.01"
                min="0"
                value={auctionData.startingPrice}
                onChange={handleChange}
                className="col-span-3"
                placeholder="e.g., 100.00"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={auctionData.startTime}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={auctionData.endTime}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Auction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuctionModal;
