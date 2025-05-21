import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // ProductService will handle axios calls
import ProductService from "../../services/ProductService.js";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";

// Assume you have a way to get the auth token, e.g., from context or local storage
const getAuthToken = () => {
  // Replace with your actual token retrieval logic
  return localStorage.getItem("token");
};

const ViewProduct = () => {
  const { id } = useParams(); // Product ID
  const [product, setProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false); // To prevent multiple clicks
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState(getAuthToken());
  const [timeRemaining, setTimeRemaining] = useState("");
// Get the token
const calculateCountdown = (targetTime) => {
  const now = new Date().getTime();
  const target = new Date(targetTime).getTime();
  const diff = target - now;

  if (diff <= 0) return "00:00:00";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};
useEffect(() => {
  let intervalId;

  if (product?.auction) {
    const targetTime =
      product.auction.status === "SCHEDULED"
        ? product.auction.startTime
        : product.auction.status === "LIVE"
        ? product.auction.endTime
        : null;

    if (targetTime) {
      intervalId = setInterval(() => {
        setTimeRemaining(calculateCountdown(targetTime));
      }, 1000);
    }
  }

  return () => clearInterval(intervalId);
}, [product]);


useEffect(() => {
  const token = getAuthToken();
  setAuthToken(token);
}, []);

  

 const fetchProductDetails = useCallback(async () => {
   if (!id) return;
   try {
     const res = await axios.get(`http://localhost:7107/product/${id}`);
     const productData = res.data.ReturnObject;
     console.log(id);
     setProduct(productData);
   } catch (err) {
     console.error("Failed to fetch product data:", err);
     if (err.response?.status === 404) navigate("/404");
   }
 }, [id, navigate]);

  // Fetch initial watchlist status for this product
  const checkWatchlistStatus = useCallback(async () => {
    if (!id || !authToken) return;
    try {
      const response = await ProductService.getUserWatchlist(authToken);
      const watchlist = response.data.ReturnObject; // Assuming ReturnObject contains the list
      if (watchlist && Array.isArray(watchlist)) {
        const isInWatchlist = watchlist.some(
          (item) => item.id === parseInt(id)
        );
        setIsWatchlisted(isInWatchlist);
      }
    } catch (error) {
      console.error("Failed to fetch watchlist status:", error);
      // Handle error, e.g., if token is invalid or server error
    }
  }, [id, authToken]);

  useEffect(() => {
    fetchProductDetails();
    checkWatchlistStatus();
  }, [fetchProductDetails, checkWatchlistStatus]);

  const handleToggleWatchlist = async () => {
    if (!authToken) {
      console.error("No auth token found. Please log in.");
      // Optionally redirect to login or show a message
      return;
    }
    if (isLoadingWatchlist) return; // Prevent multiple rapid clicks

    setIsLoadingWatchlist(true);
    try {
      const response = await ProductService.toggleWatchlist(
        product.id,
        authToken
      );
      // Update the state based on the backend's response message or a new state
      // The backend returns whether it was added or removed.
      if (response.data.message.includes("added")) {
        setIsWatchlisted(true);
      } else {
        setIsWatchlisted(false);
      }
      console.log("Watchlist toggle response:", response.data.message);
    } catch (error) {
      console.error("Failed to toggle watchlist:", error);
      // Optionally revert UI change or show error message to user
      // setIsWatchlisted(!isWatchlisted); // Revert optimistic update if it failed
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

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
        return { text: "LIVE NOW", className: "bg-green-600 text-md font-bold" };
      case "CLOSED":
        return { text: "CLOSED", className: "bg-red-600 text-md font-bold" };
      case "SCHEDULED":
        return { text: "SCHEDULED", className: "bg-blue-500 text-md font-bold" };
      default:
        return { text: "Status N/A", className: "bg-gray-500 text-md font-bold" };
    }
  };

  const auctionStatusDisplay = getAuctionStatusDisplay();

  const toggleDetails = () => setShowDetails((prev) => !prev);

  const handlePlaceBid = (id) => {
    navigate(`/bids/place/${id}`);
  };
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
      <button style={{fontFamily:"var(--font-button)"}}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 text-lg rounded mr-2 transition-colors duration-200">
        Get approved to bid
      </button>
    );
  } else if (auction.status === "LIVE") {
    actionButton = (
      <div className="">
        <button
          onClick={() => navigate(`/approve/${product.id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Get approved to Bid
        </button>

        <p
          style={{ fontFamily: "sans-serif" }}
          onClick={() => handlePlaceBid(product.id)}
          className=" cursor-pointer text-end text-blue-700 font-bold py-2 px-4  duration-200"
        >
          Place Bid
        </p>
      </div>
    );
  } else if (auction.status === "CLOSED") {
    actionButton = (
      <p className="text-red-600 medium text-right">
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
        {/* Left: Status + Name + Timer */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Badge
              className={auctionStatusDisplay.className}
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {auctionStatusDisplay.text}
            </Badge>
            <h2
              style={{ fontFamily: "var(--font-playfair)" }}
              className="text-2xl font-semibold text-red-800"
            >
              {product.name || "Product Details"}
            </h2>
          </div>
          {(auction.status === "SCHEDULED" || auction.status === "LIVE") && (
            <div className="text-sm text-gray-700 font-semibold pl-1">
              {auction.status === "SCHEDULED" && (
                <span>
                  Auction starts in:{" "}
                  <span className="text-blue-600">{timeRemaining}</span>
                </span>
              )}
              {auction.status === "LIVE" && (
                <span>
                  Time remaining:{" "}
                  <span className="text-red-600">{timeRemaining}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Save/Watchlist Button */}
        <button
          onClick={handleToggleWatchlist}
          disabled={isLoadingWatchlist}
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
            <p
              style={{ fontFamily: "var(--font-roboto)" }}
              className="text-gray-600 mt-1 text-lg"
            >
              {shortDescription}
            </p>
            <p
              className="text-xl font-bold text-gray-800 mt-2 "
              style={{ fontFamily: "var(--font-tenor)" }}
            >
              Current Highest Bid:{" "}
              <span className="text-green-600">
                {product.highestPrice
                  ? `$${product.highestPrice.toFixed(2)}`
                  : "No bids yet"}
              </span>
            </p>
            
            <button
              onClick={toggleDetails}
              className="text-blue-600 hover:underline text-md mt-1 block"
            >
              <span style={{ fontFamily: "var(--font-tenor)" }}>
                {showDetails ? "Hide full details" : "Show full details"}
              </span>
            </button>
          </div>

          <div className="mb-6 text-right">{actionButton}</div>

          {showDetails && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t pt-6 border-gray-200">
              {/* Auction Timing */}
              <div>
                <h3 style={{ fontFamily: "var(--font-dm-serif)"}}
                    className="text-lg font-medium text-gray-800 mb-2">
                  Auction Timing
                </h3>
                {auction.startTime && (
                    <p className="text-gray-700 text-sm mb-1"
                       style={{fontFamily: "var(--font-inter)"}}>
                      <span className="font-semibold ">Starts:</span>{" "}
                      <span className="text-green-600 ">{formatDateTime(auction.startTime)}</span>

                    </p>
                )}
                {auction.endTime && (
                    <p className="text-gray-700 text-sm mb-1">
                      <span className="font-semibold">Ends:</span>{" "}
                      <span className="text-red-600 ">{formatDateTime(auction.endTime)}</span>

                    </p>
                )}
              </div>

              {/* Viewing Dates */}
              <div>
              <h3  style={{ fontFamily: "var(--font-dm-serif)"}}
                  className="text-lg font-medium text-gray-800 mb-2 mt-4">
                  Viewing Dates
                </h3>
                {viewingDates.length > 0 ? (
                  viewingDates.map((date, index) => (
                    <p  style={{ fontFamily: "var(--font-inter)" }} key={index} className="text-gray-700 text-sm mb-1">
                      {date}
                    </p>
                  ))
                ) : (
                  <p style={{ fontFamily: "var(--font-inter) "}} className="text-gray-500 text-sm">
                    No viewing dates available.
                  </p>
                )}
              </div>

              {/* Product Details */}
              <div>
                <h3 style={{ fontFamily: "var(--font-dm-serif)"}} className="text-lg font-medium text-gray-800 mb-2">
                  Product Details
                </h3>
                {product.category && (
                  <p className="text-gray-700 text-sm mb-1 " style={{ fontFamily: "var(--font-roboto)"}}>
                    <span  className="font-semibold">Category:</span>{" "}
                    <span  className="font-bold text-blue-500" >
                      {product.category}
</span>
                    </p>
                )}
                <p style={{ fontFamily: "var(--font-roboto)"}} className="text-gray-700 text-sm mb-1">
                  <span className="font-semibold">Currency:</span> <span className="font-bold text-blue-500"> USD</span>
                </p>
                {product.description && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2" style={{ fontFamily: "var(--font-dm-serif)"}}>
                      Full Description:
                    </h3>
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
