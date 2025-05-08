import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import auctionService from "../services/auctionService";

const AuctionSelect = ({ onSelect }) => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    auctionService.getAllAuctions().then(setAuctions);
  }, []);

  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger className="w-full mb-4">
        <SelectValue placeholder="Select Auction" />
      </SelectTrigger>
      <SelectContent>
        {auctions.map((auction) => (
          <SelectItem key={auction.id} value={auction.id.toString()}>
            Auction #{auction.id} – Ends{" "}
            {new Date(auction.endTime).toLocaleString()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AuctionSelect;
