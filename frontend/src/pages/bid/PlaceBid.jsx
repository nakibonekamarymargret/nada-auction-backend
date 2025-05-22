import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import BidResultModal from "./BidResultModal";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import BidTimer from "./BidTimer";

const PlaceBid = () => {
  const { id: productId } = useParams();
  const [product, setProduct] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [
    normalizedCurrentUserForComparison,
    setNormalizedCurrentUserForComparison,
  ] = useState(null);
  const currentUserRef = useRef(null);
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [hasPlacedBid, setHasPlacedBid] = useState(false);
  const [myLastPlacedBidAmount, setMyLastPlacedBidAmount] = useState(null);
  const [inputBidAmount, setInputBidAmount] = useState(0.01);

  const token = localStorage.getItem("token");
  const stompClient = useRef(null);
  const connectedRef = useRef(false);

  // New state to manage the auction's live status more explicitly
  const [auctionStatus, setAuctionStatus] = useState("LOADING"); // "LOADING", "SCHEDULED", "LIVE", "CLOSED"

  // States for the unified timer logic (from previous iteration)
  const [inactivityDurationFromBackend, setInactivityDurationFromBackend] =
    useState(1800); // Default to 30 mins
  const [effectiveAuctionEndTime, setEffectiveAuctionEndTime] = useState(null);
  const [, setTimerDisplayType] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [bidApiMessage, setBidApiMessage] = useState("");
  const [bidApiWinningAmount, setBidApiWinningAmount] = useState(null);
  const [bidApiCheckoutUrl, setBidApiCheckoutUrl] = useState(null);

  const normalizeBidderName = useCallback((name) => {
    if (!name) return "";
    let normalized = name.trim().toLowerCase();
    if (normalized.includes("@") && normalized.indexOf("@") > 0) {
      normalized = normalized.split("@")[0];
    }
    return normalized;
  }, []);

  const getMinBid = useCallback((productData) => {
    return (
      productData?.highestPrice ?? productData?.auction?.startingPrice ?? 0.01
    );
  }, []);

  const deduplicateAndSort = useCallback(
    (bids) => {
      const latestBids = new Map();
      bids.forEach((bid) => {
        const normalizedBidderName = normalizeBidderName(bid.bidderName);
        if (!normalizedBidderName) return;

        const existing = latestBids.get(normalizedBidderName);
        if (!existing || bid.amount > existing.amount) {
          latestBids.set(normalizedBidderName, bid);
        }
      });
      return Array.from(latestBids.values()).sort(
        (a, b) => b.amount - a.amount
      );
    },
    [normalizeBidderName]
  );

  const fetchProductDetails = useCallback(async () => {
    console.log(`DEBUG: Fetching product details for ID: ${productId}`);
    try {
      const res = await axios.get(`http://localhost:7107/product/${productId}`);
      const productData = res.data.ReturnObject;
      setProduct(productData);
      setInputBidAmount(getMinBid(productData));

      // Determine auction status based on backend data
      const now = new Date();
      const auctionStart = productData?.auction?.startTime
        ? new Date(productData.auction.startTime)
        : null;
     

      if (productData?.auction?.status === "CLOSED" || productData?.isClosed) {
        setAuctionStatus("CLOSED");
        console.log("DEBUG: Auction status set to CLOSED on product fetch.");
      } else if (auctionStart && auctionStart > now) {
        setAuctionStatus("SCHEDULED");
        console.log("DEBUG: Auction status set to SCHEDULED on product fetch.");
      } else {
        setAuctionStatus("LIVE"); // It's open if not closed and not scheduled for future
        console.log("DEBUG: Auction status set to LIVE on product fetch.");
      }

      if (productData?.auction?.inactivityDuration) {
        setInactivityDurationFromBackend(
          productData.auction.inactivityDuration
        );
        console.log(
          "DEBUG: Inactivity duration from backend:",
          productData.auction.inactivityDuration
        );
      } else {
        console.log(
          "DEBUG: Inactivity duration not provided by backend, using default."
        );
      }
      console.log("DEBUG: Product details fetched successfully:", productData);
    } catch (err) {
      console.error("ERROR: Failed to fetch product:", err);
      Swal.fire({
        icon: "error",
        title: "Product Not Found",
        text: "Could not load product details. It might not exist or the server is down.",
      });
    }
  }, [productId, getMinBid]);

  const fetchParticipantsHttp = useCallback(async () => {
    if (!token || normalizedCurrentUserForComparison === null) {
      console.log(
        "DEBUG: Skipping fetchParticipantsHttp, token or normalizedCurrentUserForComparison is missing."
      );
      return;
    }

    console.log(`DEBUG: Fetching participants for product ID: ${productId}`);
    try {
      const res = await axios.get(
        `http://localhost:7107/bids/product/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const bids = res.data.ReturnObject?.ReturnObject || [];
      const sortedParticipants = deduplicateAndSort(bids);
      setParticipants(sortedParticipants);
      console.log("DEBUG: Participants fetched via HTTP:", sortedParticipants);

      const myBid = sortedParticipants.find(
        (b) =>
          normalizeBidderName(b.bidderName) ===
          normalizedCurrentUserForComparison
      );

      if (myBid) {
        setMyLastPlacedBidAmount(myBid.amount);
        setHasPlacedBid(true);
        setInputBidAmount((prevAmount) =>
          Math.max(prevAmount, myBid.amount, getMinBid(product))
        );
        console.log(
          `DEBUG: My bid found via HTTP: $${myBid.amount.toFixed(2)}`
        );
      } else {
        setMyLastPlacedBidAmount(null);
        setHasPlacedBid(false);
        setInputBidAmount(getMinBid(product));
      }
    } catch (err) {
      console.error(
        "ERROR: Failed to fetch participants:",
        err.response?.data || err.message
      );
      setMyLastPlacedBidAmount(null);
      setHasPlacedBid(false);
      setInputBidAmount(getMinBid(product));
    }
  }, [
    productId,
    token,
    deduplicateAndSort,
    normalizedCurrentUserForComparison,
    product,
    getMinBid,
    normalizeBidderName,
  ]);

  const fetchMyLatestBid = useCallback(async () => {
    if (!token || !currentUser || !product) {
      console.log(
        "DEBUG: Skipping fetchMyLatestBid due to missing data (token/currentUser/product)."
      );
      return;
    }
    console.log(`DEBUG: Fetching my latest bid for product ID: ${productId}`);
    try {
      const res = await axios.get(
        `http://localhost:7107/bids/my-latest/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const myBidData = res.data.ReturnObject;
      const amountValue = parseFloat(myBidData?.bid?.amount);

      if (!isNaN(amountValue)) {
        setMyLastPlacedBidAmount(amountValue);
        setInputBidAmount(Math.max(amountValue, getMinBid(product)));
        setHasPlacedBid(true);
        console.log(
          `DEBUG: fetchMyLatestBid successful. My bid: $${amountValue.toFixed(
            2
          )}`
        );
      } else {
        setMyLastPlacedBidAmount(null);
        setInputBidAmount(getMinBid(product));
        setHasPlacedBid(false);
        console.log("DEBUG: fetchMyLatestBid returned no valid bid amount.");
      }
    } catch (err) {
      console.error(
        "ERROR: Failed to fetch my latest bid:",
        err.response?.data || err.message
      );
      setMyLastPlacedBidAmount(null);
      setInputBidAmount(getMinBid(product));
      setHasPlacedBid(false);
    }
  }, [productId, token, currentUser, product, getMinBid]);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userSub = payload?.sub;
        setCurrentUser(userSub);
        const normalizedForComparison = normalizeBidderName(userSub);
        setNormalizedCurrentUserForComparison(normalizedForComparison);
        currentUserRef.current = userSub;
      } catch (e) {
        console.error("ERROR: Failed to parse JWT token.", e);
        setCurrentUser(null);
        setNormalizedCurrentUserForComparison(null);
        currentUserRef.current = null;
      }
    } else {
      console.log("DEBUG: No token found in localStorage.");
      setCurrentUser(null);
      setNormalizedCurrentUserForComparison(null);
      currentUserRef.current = null;
    }
  }, [token, normalizeBidderName]);

  useEffect(() => {
    const initProduct = async () => {
      await fetchProductDetails();
    };
    initProduct();
  }, [fetchProductDetails]);

  useEffect(() => {
    if (
      product &&
      currentUser &&
      normalizedCurrentUserForComparison 
    ) {
      if (token) {
        fetchMyLatestBid();
      } else {
        console.log("DEBUG: Skipping initial bid fetch, token is missing.");
      }
    }
  }, [
    token,
    product,
    fetchMyLatestBid,
    currentUser,
    normalizedCurrentUserForComparison,
  ]);

  // WebSocket connection
  useEffect(() => {
    if (
      !productId ||
      !token ||
      !currentUserRef.current ||
      !normalizedCurrentUserForComparison ||
      auctionStatus === "SCHEDULED" // Do not connect WS if scheduled
    ) {
      console.log(
        "DEBUG: WebSocket connection skipped. Missing data or auction is SCHEDULED."
      );
      return;
    }

    const connect = () => {
      console.log("DEBUG: Attempting WebSocket connection...");
      const socket = new SockJS(`http://localhost:7107/ws?authToken=${token}`);
      const client = Stomp.over(socket);
      client.debug = (str) => {
        if (str.startsWith("ERROR")) {
          console.error("STOMP ERROR:", str);
        }
      };

      client.connect(
        {},
        () => {
          connectedRef.current = true;
          stompClient.current = client;
          console.log("DEBUG: WebSocket connected.");

          client.subscribe(`/topic/bids/${productId}`, (message) => {
            console.log("🟢 WebSocket: Received message.");

            try {
              const newBidOrBids = JSON.parse(message.body);
              const incomingBids = Array.isArray(newBidOrBids)
                ? newBidOrBids
                : [newBidOrBids];

              setProduct((prev) => {
                if (!prev) return null;
                let newHighestPrice = prev.highestPrice ?? 0;
                let newLastBidTime = prev.lastBidTime;
                let isClosedFromWS =
                  prev.isClosed || prev.auction?.status === "CLOSED";

                if (incomingBids.length > 0) {
                  const highestIncomingBid = incomingBids.reduce(
                    (maxBid, currentBid) =>
                      currentBid.amount > maxBid.amount ? currentBid : maxBid
                  );

                  if (highestIncomingBid.amount > newHighestPrice) {
                    newHighestPrice = highestIncomingBid.amount;
                    console.log(
                      `DEBUG: Product highest price updated via WS to $${newHighestPrice.toFixed(
                        2
                      )}`
                    );
                  }

                  if (highestIncomingBid.bidTime) {
                    newLastBidTime = highestIncomingBid.bidTime;
                  }
                  if (highestIncomingBid.productIsClosed !== undefined) {
                    isClosedFromWS = highestIncomingBid.productIsClosed;
                    console.log(
                      `DEBUG: WS: Product closed status updated to ${isClosedFromWS}`
                    );
                  }
                  if (highestIncomingBid.auctionStatus !== undefined) {
                    isClosedFromWS =
                      highestIncomingBid.auctionStatus === "CLOSED";
                  }
                }

                setInputBidAmount((prevInputAmount) => {
                  const calculatedNewInput = Math.max(
                    prevInputAmount,
                    newHighestPrice,
                    myLastPlacedBidAmount || 0
                  );
                  console.log(
                    `DEBUG: inputBidAmount updated via WS to $${calculatedNewInput.toFixed(
                      2
                    )}`
                  );
                  return calculatedNewInput;
                });

                return {
                  ...prev,
                  highestPrice: newHighestPrice,
                  lastBidAmount: newHighestPrice,
                  lastBidTime: newLastBidTime,
                  isClosed: isClosedFromWS,
                  auction: {
                    ...prev.auction,
                    status: isClosedFromWS ? "CLOSED" : prev.auction?.status,
                  },
                };
              });

              setParticipants((prevParticipants) => {
                const combinedBids = [...prevParticipants, ...incomingBids];
                const latestAndDeduplicated = deduplicateAndSort(combinedBids);
                console.log(
                  "DEBUG: WS: Combined and deduplicated participants."
                );

                const myBid = latestAndDeduplicated.find(
                  (b) =>
                    normalizeBidderName(b.bidderName) ===
                    normalizedCurrentUserForComparison
                );

                if (myBid) {
                  setMyLastPlacedBidAmount(myBid.amount);
                  setHasPlacedBid(true);
                  console.log(
                    `DEBUG: WS: My bid found: $${myBid.amount.toFixed(2)}`
                  );
                } else {
                  setMyLastPlacedBidAmount(null);
                  setHasPlacedBid(false);
                  console.log(
                    "DEBUG: WS: My bid NOT found in latest participants list."
                  );
                }
                return latestAndDeduplicated;
              });
            } catch (e) {
              console.error(
                "ERROR: Error parsing WebSocket message:",
                e,
                message.body
              );
            }
          });

          fetchParticipantsHttp();
        },
        (error) => {
          console.error("ERROR: WebSocket connection error:", error);
          connectedRef.current = false;
          stompClient.current = null;
          setTimeout(connect, 3000);
        }
      );
    };

    connect();

    return () => {
      if (stompClient.current && connectedRef.current) {
        console.log("DEBUG: Disconnecting WebSocket.");
        stompClient.current.disconnect(() => {
          console.log("DEBUG: WebSocket disconnected successfully.");
        });
        connectedRef.current = false;
        stompClient.current = null;
      }
    };
  }, [
    productId,
    token,
    fetchParticipantsHttp,
    deduplicateAndSort,
    currentUserRef,
    myLastPlacedBidAmount,
    normalizeBidderName,
    normalizedCurrentUserForComparison,
    auctionStatus, // Added auctionStatus to dependencies
  ]);

  // --- Master Timer Logic to determine effectiveAuctionEndTime for BidTimer ---
  useEffect(() => {
    let intervalId;

    if (!product) {
      setEffectiveAuctionEndTime(null);
      setTimerDisplayType("Loading...");
      return;
    }

    const calculateEffectiveTime = () => {
      const now = new Date();
      let calculatedEndTime = null;
      let currentTimerType = "";

      // Update auctionStatus here based on dynamic time calculation
      const auctionStart = product?.auction?.startTime
        ? new Date(product.auction.startTime)
        : null;

      if (product?.auction?.status === "CLOSED" || product?.isClosed) {
        setAuctionStatus("CLOSED"); // Force closed if backend says so
      } else if (auctionStart && auctionStart > now) {
        // If start time is in the future
        calculatedEndTime = auctionStart.toISOString(); // Countdown to start time
        currentTimerType = "scheduledStart"; // New type for scheduled auctions
        setAuctionStatus("SCHEDULED");
      } else if (product.auction?.endTime) {
        const auctionEnd = new Date(product.auction.endTime);
        if (isNaN(auctionEnd.getTime())) {
          console.warn(
            "DEBUG Timer: product.auction.endTime is an invalid date:",
            product.auction.endTime
          );
          // Fallback to inactivity if fixed auction end is invalid
          if (product.lastBidTime) {
            const lastBidDate = new Date(product.lastBidTime);
            const inactivityEnd = new Date(
              lastBidDate.getTime() + inactivityDurationFromBackend * 1000
            );
            calculatedEndTime = inactivityEnd.toISOString();
            currentTimerType = "inactivity";
            setAuctionStatus("LIVE");
          } else {
            const projectedFirstBidEnd = new Date(
              now.getTime() + inactivityDurationFromBackend * 1000
            );
            calculatedEndTime = projectedFirstBidEnd.toISOString();
            currentTimerType = "awaitingFirstBid";
            setAuctionStatus("LIVE"); // Still consider it live, just no bids yet
          }
        } else if (auctionEnd > now) {
          calculatedEndTime = auctionEnd.toISOString();
          currentTimerType = "auction";
          setAuctionStatus("LIVE");
        } else {
          // Fixed auction time has passed, now check inactivity
          if (product.lastBidTime) {
            const lastBidDate = new Date(product.lastBidTime);
            const inactivityEnd = new Date(
              lastBidDate.getTime() + inactivityDurationFromBackend * 1000
            );
            if (inactivityEnd > now) {
              calculatedEndTime = inactivityEnd.toISOString();
              currentTimerType = "inactivity";
              setAuctionStatus("LIVE");
            } else {
              // Both fixed auction and inactivity passed
              calculatedEndTime = now.toISOString();
              currentTimerType = "closed";
              setAuctionStatus("CLOSED");
            }
          } else {
            // Fixed auction passed, no bids placed for inactivity timer
            calculatedEndTime = now.toISOString();
            currentTimerType = "closed";
            setAuctionStatus("CLOSED");
          }
        }
      } else if (product.lastBidTime) {
        // No fixed auction end, rely solely on inactivity
        const lastBidDate = new Date(product.lastBidTime);
        const inactivityEnd = new Date(
          lastBidDate.getTime() + inactivityDurationFromBackend * 1000
        );
        if (inactivityEnd > now) {
          calculatedEndTime = inactivityEnd.toISOString();
          currentTimerType = "inactivity";
          setAuctionStatus("LIVE");
        } else {
          // Inactivity passed
          calculatedEndTime = now.toISOString();
          currentTimerType = "closed";
          setAuctionStatus("CLOSED");
        }
      } else {
        // No fixed end, no bids placed yet. Timer will start from now for inactivity
        const projectedFirstBidEnd = new Date(
          now.getTime() + inactivityDurationFromBackend * 1000
        );
        calculatedEndTime = projectedFirstBidEnd.toISOString();
        currentTimerType = "awaitingFirstBid";
        setAuctionStatus("LIVE"); // Still live, just awaiting first bid
      }

      setEffectiveAuctionEndTime(calculatedEndTime);
      setTimerDisplayType(currentTimerType);
    };

    calculateEffectiveTime();
    intervalId = setInterval(calculateEffectiveTime, 1000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    product,
    inactivityDurationFromBackend,
    // Note: auctionStatus is set *inside* this useEffect and also used as a dependency to trigger re-calculation.
    // This creates a dependency loop which is often bad.
    // However, in this case, `auctionStatus` is set based on time and product data,
    // so it doesn't cause infinite loops, but rather ensures the status is up-to-date.
    // For simpler cases, it's better to derive `auctionStatus` purely in render or avoid setting it in useEffect directly from itself.
    // For now, let's keep it, but be mindful of potential issues.
  ]);

  const handleSubmitBid = async (e) => {
    e.preventDefault();

    if (auctionStatus !== "LIVE") {
      Swal.fire({
        icon: "warning",
        title: "Auction Not Live",
        text: "You cannot place a bid on an auction that is not currently live.",
      });
      return;
    }

    const bidValue = Number(inputBidAmount);
    const minBid = getMinBid(product);

    if (isNaN(bidValue) || bidValue <= minBid) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Bid",
        text: `Your bid must be greater than the current highest price ($${minBid.toFixed(
          2
        )}).`,
      });
      return;
    }

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "You must be logged in to place a bid.",
      });
      return;
    }

    console.log(`DEBUG: Attempting to place bid: $${bidValue.toFixed(2)}`);
    try {
      const res = await axios.post(
        `http://localhost:7107/bids/place/${productId}`,
        { amount: bidValue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Bid Placed",
        text:
          res.data.ReturnObject?.message ||
          "Your bid has been placed successfully!",
      });

      // Update product's lastBidTime immediately to trigger timer reset
      setProduct((prev) => ({
        ...prev,
        highestPrice: bidValue,
        lastBidAmount: bidValue,
        lastBidTime: new Date().toISOString(),
        isClosed: false, // Ensure it's marked as not closed if a new bid comes in
        auction: {
          ...prev.auction,
          status: "OPEN", // Assuming OPEN means LIVE
        },
      }));

      setHasPlacedBid(true);
      setShowForm(false);
      setShowAmountInput(false);

      setMyLastPlacedBidAmount(bidValue);
      setInputBidAmount(bidValue);
      console.log(
        `DEBUG: Bid placed successfully. myLastPlacedBidAmount updated to: $${bidValue.toFixed(
          2
        )}`
      );

      setParticipants((prev) =>
        deduplicateAndSort([
          ...prev,
          {
            bidderName: currentUser,
            amount: bidValue,
            bidTime: new Date().toISOString(),
          },
        ])
      );
    } catch (error) {
      const message =
        error.response?.data?.ReturnObject ||
        error.response?.data?.message ||
        "Failed to place bid.";
      console.error(
        "ERROR: Failed to place bid:",
        error.response?.data || error.message
      );
      Swal.fire({
        icon: "error",
        title: "Error Placing Bid",
        text: message,
      });
    }
  };

  const handleCancelBid = () => {
    setInputBidAmount(myLastPlacedBidAmount ?? getMinBid(product));
    setShowForm(false);
    setShowAmountInput(false);
    console.log(
      `DEBUG: Bid canceled. Input bid amount reset to $${(
        myLastPlacedBidAmount ?? getMinBid(product)
      ).toFixed(2)}`
    );
  };

  const handleUpdateBid = () => {
    handleSubmitBid({ preventDefault: () => {} });
  };

  const handleViewBidResults = async () => {
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "Please log in to view bid results.",
      });
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:7107/bids/check-result/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = res.data.ReturnObject;

      setBidApiMessage(result.message);
      setBidApiWinningAmount(result.winningAmount || null);
      setBidApiCheckoutUrl(result.checkoutUrl || null);

      setShowModal(true);
      console.log("DEBUG: Bid results fetched:", result);
    } catch (error) {
      console.error(
        "ERROR: Failed to fetch bid results:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.ReturnObject ||
        error.response?.data?.message ||
        "Could not fetch bid results.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  // --- Render ---
  if (!product) return <div className="p-4">Loading product details...</div>;


  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString(); // Formats to local date/time string
  };

  return (
    <div className="container mx-auto p-6">
      {currentUser && (
        <p className="text-lg font-semibold text-gray-700 mb-4 text-center">
          Logged in as:{" "}
          <span className="text-blue-700 font-bold">{currentUser}</span>
        </p>
      )}

      <h2 className="text-3xl font-bold mb-6 text-center">
        Auction Room: {product?.auction?.title || "Loading..."}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <img
            src={
              product.imageUrl ||
              "https://via.placeholder.com/400x300?text=No+Image"
            }
            alt={product.name}
            className="w-full h-60 object-cover rounded-lg mb-4"
          />
          <h3 className="text-xl font-semibold text-red-900">{product.name}</h3>
          <p className="text-gray-600 mt-2 mb-4">
            {product.description || "No description available."}
          </p>
          <p className="text-md font-bold text-gray-800 mt-2">
            Current Highest Bid:{" "}
            <span className="text-md font-bold text-green-700 ml-2">
              {product.highestPrice
                ? `$${product.highestPrice.toFixed(2)}`
                : `$${product?.auction?.startingPrice?.toFixed(2) || "0.00"}`}
            </span>
          </p>

          {/* Conditional rendering for My Bid Price / Place Bid / Update Bid */}
          {auctionStatus === "LIVE" && (
            <div className="flex items-center space-x-2 mt-3">
              {!showAmountInput ? (
                <>
                  <p className="text-md font-bold text-black">
                    My Bid Price:
                    {myLastPlacedBidAmount !== null ? (
                      <span className="text-md font-bold text-green-700 ml-1">
                        ${myLastPlacedBidAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-md text-gray-500 ml-1">0.00</span>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setShowAmountInput(true);
                      setInputBidAmount(
                        myLastPlacedBidAmount ?? getMinBid(product)
                      );
                    }}
                    className="text-blue-500 font-bold text-xl"
                    title="Update Bid"
                  >
                    +
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    value={inputBidAmount}
                    step="0.01"
                    id="inputBidAmount"
                    onChange={(e) =>
                      setInputBidAmount(parseFloat(e.target.value) || 0)
                    }
                    className="border rounded px-2 py-1 w-24"
                    min={getMinBid(product).toFixed(2)}
                  />
                  <button
                    onClick={handleUpdateBid}
                    className="text-sm text-green-600 font-bold hover:underline"
                  >
                    OK
                  </button>
                  <button
                    onClick={handleCancelBid}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}

          {/* Main action area based on auction status */}
          {auctionStatus === "CLOSED" ? (
            <div className="mt-6 text-center">
              <p
                style={{ fontFamily: "var(--font-tenor)" }}
                className="text-lg text-red-600 font-semibold mb-4"
              >
                Bidding is closed for this product.
              </p>
              <button
                onClick={handleViewBidResults}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                View Bid Results
              </button>
            </div>
          ) : auctionStatus === "SCHEDULED" ? (
            <div className="mt-6 text-center">
              <p className="text-lg text-blue-600 font-semibold mb-4">
                This auction is scheduled to start on:
              </p>
              <p className="text-xl font-bold text-blue-800">
                {formatDateTime(product?.auction?.startTime)}
              </p>
              <p className="text-gray-600 mt-2">
                Come back then to place your bid!
              </p>
            </div>
          ) : (
            // Auction is LIVE
            <>
              {!showForm && !hasPlacedBid && !showAmountInput && (
                <button
                  onClick={() => {
                    setShowForm(true);
                    setInputBidAmount(getMinBid(product));
                  }}
                  className="mt-4 text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 font-bold"
                >
                  Place Bid
                </button>
              )}
              {showForm && (
                <form onSubmit={handleSubmitBid} className="mt-6">
                  <div className="mb-4">
                    <label
                      htmlFor="inputBidAmount"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Your Bid Amount ($):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      id="inputBidAmount"
                      value={inputBidAmount}
                      onChange={(e) =>
                        setInputBidAmount(parseFloat(e.target.value) || 0)
                      }
                      className="border rounded w-full py-2 px-3"
                      required
                      min={getMinBid(product).toFixed(2)}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Place Bid
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelBid}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        <div className=" px-6 mx-6 bg-gray-50 rounded-xl shadow-md p-6  justify-center">
          <h3 className="text-2xl font-semibold mb-1 text-center">
            Bidding Participants
          </h3>
          <div className="flex flex-col items-center mt-4">
            <div className="w-90 bg-gray-800 text-white rounded-full py-3 px-6 text-xl font-mono flex items-center justify-center gap-1 mb-2">
              <BidTimer auctionEndTime={effectiveAuctionEndTime} />
            </div>
          </div>

          <div className="flex justify-center items-center mt-4 text-sm text-gray-500">
            <span className="mr-2">Waiting for more participants</span>
            <div className="flex space-x-1">
              <span className="w-3 h-3 bg-red-400 rounded-full animate-bounce"></span>
              <span className="w-3 h-2 bg-black rounded-full animate-bounce delay-300"></span>
              <span className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-3 h-2 bg-black rounded-full animate-bounce delay-300"></span>
              <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
          <div className="mt-3">
            {participants.length === 0 ? (
              <p className="text-gray-500 text-center">No bids yet.</p>
            ) : (
              <ul className="space-y-3">
                {participants.map((bid, index) => {
                  const isMe =
                    normalizeBidderName(bid.bidderName) ===
                    normalizedCurrentUserForComparison;
                  const isHighest = index === 0;
                  let textColorClass = "text-gray-800";
                  if (isMe) textColorClass = "text-blue-600 font-semibold";
                  if (isHighest && !isMe)
                    textColorClass = "text-green-600 font-semibold";
                  if (isHighest && isMe)
                    textColorClass = "text-purple-600 font-bold";

                  return (
                    <li
                      key={`${bid.bidderName}-${bid.amount}-${index}`}
                      className={`flex justify-between ${textColorClass}`}
                    >
                      <span>
                        <span className="text-md">
                          {bid.bidderName}
                          {isMe && (
                            <span className="text-sm text-purple-500">
                              {" "}
                              (me)
                            </span>
                          )}
                        </span>{" "}
                        {isHighest ? " 🏆" : ""}
                      </span>{" "}
                      <span>${bid.amount.toFixed(2)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <BidResultModal
        isOpen={showModal}
        onOpenChange={(open) => setShowModal(open)}
        bidApiMessage={bidApiMessage}
        bidApiWinningAmount={bidApiWinningAmount}
        bidApiCheckoutUrl={bidApiCheckoutUrl}
      />
    </div>
  );
};

export default PlaceBid;
