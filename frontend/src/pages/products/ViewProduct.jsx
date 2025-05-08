import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";

const ViewProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const navigate = useNavigate();

  const fetchProduct = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:7107/product/${id}`);
      const productData = res.data.ReturnObject;
      setProduct(productData);
    } catch (err) {
      console.error("Failed to fetch product data:", err);
      if (err.response?.status === 404) navigate("/404");
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Format date-time safely
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    try {
      const date = typeof dateTime === "string" ? parseISO(dateTime) : dateTime;
      if (isNaN(date.getTime())) throw new Error("Invalid date value");
      return format(date, "dd MMM yyyy HH:mm z");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Generate viewing dates between auction start and end time
  const getViewingDates = (startTime, endTime) => {
    if (!startTime || !endTime) return [];

    try {
      const start = parseISO(startTime);
      const end = parseISO(endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

      return eachDayOfInterval({ start, end }).map((date) =>
        format(date, "dd MMM yyyy '10:00 BST - 14:00 BST'")
      );
    } catch (e) {
      console.error("Error generating viewing dates:", e);
      return [];
    }
  };

  // Get auction status with display text and class name
  const getAuctionStatusDisplay = () => {
    const status = product?.auction?.status;

    switch (status) {
      case "LIVE":
        return { text: "LIVE NOW", className: "bg-green-600" };
      case "CLOSED":
        return { text: "CLOSED", className: "bg-red-600" };
      case "SCHEDULED":
        return { text: "SCHEDULED", className: "bg-blue-500" };
      default:
        return { text: "Status N/A", className: "bg-gray-500" };
    }
  };

  const auctionStatusDisplay = getAuctionStatusDisplay();

  const toggleDetails = () => setShowDetails((prev) => !prev);
  const toggleWatchlist = () => setIsWatchlisted((prev) => !prev);
// const handleWatchLiveAuction = () => {
//   const auctionId = auction.id;
//   const watchWindow = window.open(`/watch-auction/${auctionId}`, "_blank");
//   if (!watchWindow) {
//     alert("Please allow pop-ups to watch the auction.");
//   }
// };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        Loading product details...
      </div>
    );
  }

  const shortDescription = product.description
    ? product.description.slice(0, 150) +
      (product.description.length > 150 ? "..." : "")
    : "No description available.";

  const auction = product.auction || {};
  const viewingDates = getViewingDates(auction.startTime, auction.endTime);

  let actionButton = null;

  if (auction.status === "SCHEDULED") {
    actionButton = (
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2 transition-colors duration-200">
        Get approved to bid
      </button>
    );
  } else if (auction.status === "LIVE") {
    actionButton = (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
        <button
          onClick={() => navigate(`/live-auction/${auction.id}`)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          View Live Auction
        </button>

        <button
          onClick={() => window.open(`/watch-auction/${auction.id}`, "_blank")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Watch Auction
        </button>
      </div>
<<<<<<< HEAD
=======

>>>>>>> b9164b7258b837b66d59c9084b5c8d6537e5285d
    );
  } else if (auction.status === "CLOSED") {
    actionButton = (
      <p className="text-red-600 font-semibold text-right">
        Bidding is closed for this item.
      </p>
    );
  } else {
    actionButton = (
      <p className="text-gray-500 text-right">
        Auction status is not available.
      </p>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-white shadow-md rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Badge className={auctionStatusDisplay.className}>
            {auctionStatusDisplay.text}
          </Badge>
          <h2 className="text-xl font-semibold text-gray-800">
            {product.name || "Product Details"}
          </h2>
        </div>
        <button
          onClick={toggleWatchlist}
          className={`flex items-center gap-1 px-3 py-1 rounded-full border ${
            isWatchlisted
              ? "bg-red-100 text-red-600 border-red-300"
              : "text-gray-600 border-gray-300"
          } hover:bg-red-50 transition-colors duration-200`}
        >
          {isWatchlisted ? <FaHeart size={16} /> : <CiHeart size={20} />}
          {isWatchlisted ? "Saved" : "Save"}
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <img
            src={product.imageUrl || "placeholder-image.jpg"}
            alt={product.name || "Product Image"}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>

        <div className="md:col-span-2 p-6 pt-0">
          <div className="mb-4">
            <p className="text-gray-600 mt-1">{shortDescription}</p>
            <p className="text-xl font-bold text-gray-800 mt-2">
              Current Highest Bid:{" "}
              {product.highestPrice
                ? `$${product.highestPrice.toFixed(2)}`
                : "No bids yet"}
            </p>
            <p className="text-gray-700 text-sm mt-1">
              Last Bid: {formatDateTime(product.lastBidTime)}
            </p>
            <button
              onClick={toggleDetails}
              className="text-blue-600 hover:underline text-sm mt-1 block"
            >
              {showDetails ? "Hide full details" : "Show full details"}
            </button>
          </div>

          <div className="mb-6 text-right">{actionButton}</div>

          {showDetails && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t pt-6 border-gray-200">
              {/* Auction Timing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Auction Timing
                </h3>
                {auction.startTime && (
                  <p className="text-gray-700 text-sm mb-1">
                    <span className="font-semibold">Starts:</span>{" "}
                    {formatDateTime(auction.startTime)}
                  </p>
                )}
                {auction.endTime && (
                  <p className="text-gray-700 text-sm mb-1">
                    <span className="font-semibold">Ends:</span>{" "}
                    {formatDateTime(auction.endTime)}
                  </p>
                )}
              </div>

              {/* Viewing Dates */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">
                  Viewing Dates
                </h3>
                {viewingDates.length > 0 ? (
                  viewingDates.map((date, index) => (
                    <p key={index} className="text-gray-700 text-sm mb-1">
                      {date}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No viewing dates available.
                  </p>
                )}
              </div>

              {/* Product Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Product Details
                </h3>
                {product.category && (
                  <p className="text-gray-700 text-sm mb-1">
                    <span className="font-semibold">Category:</span>{" "}
                    {product.category}
                  </p>
                )}
                <p className="text-gray-700 text-sm mb-1">
                  <span className="font-semibold">Currency:</span> USD
                </p>
                {product.description && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Full Description:
                    </h4>
                    <p className="text-gray-700 text-sm">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
