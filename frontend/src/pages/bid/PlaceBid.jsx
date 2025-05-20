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
  const currentUserRef = useRef(null);
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [hasPlacedBid, setHasPlacedBid] = useState(false);
  const [amount, setAmount] = useState(null);
  const token = localStorage.getItem("token");
  const stompClient = useRef(null);
  const timerRef = useRef(null);
  const connectedRef = useRef(false);
  const [biddingClosed, setBiddingClosed] = useState(false); // This can represent inactivity closing the auction

  // Modal-related states (will be populated by the API call)
  const [showModal, setShowModal] = useState(false);
  const [bidApiMessage, setBidApiMessage] = useState("");
  const [bidApiWinningAmount, setBidApiWinningAmount] = useState(null);
  const [bidApiCheckoutUrl, setBidApiCheckoutUrl] = useState(null);

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser(payload?.sub);
      currentUserRef.current = payload?.sub;
    }
  }, [token, productId]);

  const getMinBid = (product) => {
    return product?.highestPrice ?? product?.auction?.startingPrice ?? 0.01;
  };

  const fetchProductDetails = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:7107/product/${productId}`);
      const productData = res.data.ReturnObject;
      setProduct(productData);
      setAmount(getMinBid(productData));
      // Set biddingClosed if the backend reports the auction is already closed
      if (productData?.auction?.status === "CLOSED" || productData?.isClosed) {
        setBiddingClosed(true);
      }
    } catch (err) {
      console.error("Failed to fetch product:", err);
    }
  }, [productId]);

  const deduplicateAndSort = useCallback((bids) => {
    const latestBids = new Map();
    bids.forEach((bid) => {
      const existing = latestBids.get(bid.bidderName);
      if (!existing || bid.amount > existing.amount) {
        latestBids.set(bid.bidderName, bid);
      }
    });
    return Array.from(latestBids.values()).sort((a, b) => b.amount - a.amount);
  }, []);

  const fetchParticipantsHttp = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:7107/bids/product/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const bids = res.data.ReturnObject.ReturnObject;
      setParticipants(deduplicateAndSort(bids));
    } catch (err) {
      console.error("Failed to fetch participants:", err);
    }
  }, [productId, token, deduplicateAndSort]);

 const fetchMyLatestBid = useCallback(
   async (basePrice) => {
     try {
       const res = await axios.get(
         `http://localhost:7107/bids/my-latest/${productId}`,
         { headers: { Authorization: `Bearer ${token}` } }
       );
       const myBid = res.data.ReturnObject;
       const amountValue = parseFloat(myBid?.bid?.amount);
       if (!isNaN(amountValue)) {
         setAmount(amountValue);
         setHasPlacedBid(true);
       } else {
         setAmount(basePrice);
         setHasPlacedBid(false);
       }
     } catch {
       setAmount(basePrice);
       setHasPlacedBid(false);
     }
   },
   [productId, token]
 );

  // Initial data fetch
  useEffect(() => {
    const init = async () => {
      await fetchProductDetails();
      if (token) await fetchMyLatestBid();
    };
    init();
  }, [productId, token, fetchProductDetails, fetchMyLatestBid]); // Add dependencies

  // WebSocket connection
  useEffect(() => {
    if (!productId || !token || !currentUserRef.current) return;

    const connect = () => {
      const socket = new SockJS(`http://localhost:7107/ws?authToken=${token}`);
      const client = Stomp.over(socket);
      client.debug = () => {};
      client.connect(
        {},
        () => {
          connectedRef.current = true;
          stompClient.current = client;

          client.subscribe(`/topic/bids/${productId}`, (message) => {
            try {
              const newBidOrBids = JSON.parse(message.body);
              const incomingBids = Array.isArray(newBidOrBids)
                ? newBidOrBids
                : [newBidOrBids];

              setProduct((prev) => {
                if (!prev) return null;
                let newHighestPrice = prev.highestPrice;
                if (incomingBids.length > 0) {
                  const highestIncomingBid = incomingBids.reduce(
                    (maxBid, currentBid) =>
                      currentBid.amount > maxBid.amount ? currentBid : maxBid
                  );
                  if (highestIncomingBid.amount > newHighestPrice) {
                    newHighestPrice = highestIncomingBid.amount;
                  }
                }
                return {
                  ...prev,
                  highestPrice: newHighestPrice,
                  lastBidAmount: newHighestPrice,
                };
              });

              setParticipants((prevParticipants) => {
                const combinedBids = [...prevParticipants, ...incomingBids];
                const latestAndDeduplicated = deduplicateAndSort(combinedBids);

                const myBid = latestAndDeduplicated.find(
                  (b) => b.bidderName === currentUserRef.current
                );
                if (myBid) {
                  setAmount(myBid.amount);
                  setHasPlacedBid(true);
                }

                if (timerRef.current) {
                  timerRef.current.resetTimer();
                  setBiddingClosed(false); // Reset inactivity flag on new bid
                }

                return latestAndDeduplicated;
              });
            } catch (e) {
              console.error(
                "Error parsing WebSocket message:",
                e,
                message.body
              );
            }
          });
          fetchParticipantsHttp();
        },
        (error) => {
          console.error("WebSocket error:", error);
          setTimeout(connect, 3000);
        }
      );
    };

    connect();

    return () => {
      if (stompClient.current && connectedRef.current) {
        stompClient.current.disconnect();
      }
    };
  }, [productId, token, fetchParticipantsHttp, deduplicateAndSort]);

  // Determine if auction is officially over (either by backend status or frontend inactivity)
  const isAuctionOver =
    product?.auction?.status === "CLOSED" || product?.isClosed || biddingClosed;

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    const bidValue = Number(amount);
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
        text: res.data.ReturnObject?.message,
      });

      if (timerRef.current) {
        timerRef.current.resetTimer();
        setBiddingClosed(false); // Reset inactivity flag on new bid
      }
      setHasPlacedBid(true);
      setShowForm(false);
      setShowAmountInput(false);

      setParticipants((prev) =>
        deduplicateAndSort([
          ...prev,
          { bidderName: currentUser, amount: bidValue },
        ])
      );

      setProduct((prev) => ({
        ...prev,
        highestPrice: bidValue,
        lastBidAmount: bidValue,
      }));
    } catch (error) {
      const message = error.response?.data?.ReturnObject;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: message || "Failed to place bid.",
      });
    }
  };

  const handleCancelBid = () => {
    setAmount(getMinBid(product));
    setShowForm(false);
    setShowAmountInput(false);
  };

  const handleUpdateBid = () => {
    setShowForm(true);
    setShowAmountInput(false);
  };

  // NEW: Function to fetch bid results from backend and populate modal states
  const handleViewBidResults = async () => {
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

      setShowModal(true); // Open the modal after getting results
    } catch (error) {
      console.error("Failed to fetch bid results:", error);
      const errorMessage =
        error.response?.data?.ReturnObject || "Could not fetch bid results.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  // REMOVE THIS useEffect. It was the cause of the incorrect message.
  // The correct message comes from the backend API.
  /*
  useEffect(() => {
    if (!product?.auction?.endTime || !participants.length) return;
    const checkAuctionEnd = setInterval(() => {
      const now = new Date();
      const endTime = new Date(product.auction.endTime);
      const isClosed = product.auction.status === "CLOSED" || product.isClosed;
      if (now >= endTime || isClosed) {
        clearInterval(checkAuctionEnd);
        const winner = participants[0];
        const userIsWinner = winner?.bidderName === currentUser;
        setIsWinner(userIsWinner); // This was setting the frontend state incorrectly
        setWinningBidAmount(winner?.amount ?? null); // This was setting the frontend state incorrectly
        setShowModal(true); // Open modal
      }
    }, 1000);
    return () => clearInterval(checkAuctionEnd);
  }, [
    product?.auction?.endTime,
    product?.auction?.status,
    product?.isClosed,
    participants,
    currentUser,
  ]);
  */

  // Keep the inactivity check, but ensure it sets biddingClosed, which is part of isAuctionOver
  useEffect(() => {
    if (!product || !product.lastBidTime) return;
    const checkInactivity = () => {
      const lastBidTime = new Date(product.lastBidTime);
      const now = new Date();
      const diffSeconds = Math.floor((now - lastBidTime) / 1000);
      if (diffSeconds >= 30 && !biddingClosed) {
        setBiddingClosed(true); // Close bidding due to inactivity
      }
    };
    checkInactivity(); // Run immediately once
    const interval = setInterval(checkInactivity, 5000); // Check every 5s
    return () => clearInterval(interval);
  }, [product?.lastBidTime, biddingClosed, product]);

  if (!product) return <div className="p-4">Loading product details...</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Auction Room: {product?.auction?.title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Product Info */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <img
            src={
              product.imageUrl ||
              "https://via.placeholder.com/400x300?text=No+Image "
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
                : "No bids yet"}
            </span>
          </p>
          <div className="flex items-center space-x-2 mt-3">
            {!showAmountInput ? (
              <>
                <p className="text-md font-bold text-black">
                  My Bid Price:
                  {hasPlacedBid && amount !== null ? (
                    <span className="text-md font-bold text-green-700 ml-1">
                      ${amount.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-md text-gray-500 ml-1">0.00</span>
                  )}
                </p>
                {!isAuctionOver && (
                  <button
                    onClick={() => setShowAmountInput(true)}
                    className="text-blue-500 font-bold text-xl"
                    title="Update Bid"
                  >
                    +
                  </button>
                )}
              </>
            ) : (
              <>
                <input
                  type="number"
                  value={amount}
                  step="0.01"
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="border rounded px-2 py-1 w-24"
                />
                <button
                  onClick={handleUpdateBid}
                  className="text-sm text-green-600 font-bold"
                >
                  OK
                </button>
                <button
                  onClick={() => setShowAmountInput(false)}
                  className="text-sm text-red-500"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Auction Ends:{" "}
            {product.auction?.endTime
              ? new Date(product.auction.endTime).toLocaleString()
              : "N/A"}
          </p>

          {/* Conditional rendering for bidding section */}
          {isAuctionOver ? (
            <div className="mt-6 text-center">
              <p style={{fontFamily:"var(--font-tenor)"}}
                className=" text-lg text-red-600 font-semibold mb-4">
                Bidding is closed for this product.
              </p>
              <button
                onClick={handleViewBidResults} 
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                View Bid Results
              </button>
            </div>
          ) : (
            <>
              {!showForm && !hasPlacedBid && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 font-bold"
                >
                  Place Bid
                </button>
              )}
              {showForm && (
                <form onSubmit={handleSubmitBid} className="mt-6">
                  <div className="mb-4">
                    <label
                      htmlFor="amount"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Your Bid Amount ($):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      id="amount"
                      value={amount}
                      onChange={(e) =>
                        setAmount(parseFloat(e.target.value) || 0)
                      }
                      className="border rounded w-full py-2 px-3"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Place
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

        {/* Participants */}
        <div className=" px-6 mx-6 bg-gray-50 rounded-xl shadow-md p-6  justify-center">
          <h3 className="text-2xl font-semibold mb-1 text-center">
            Bidding Participants
          </h3>
          <BidTimer
            ref={timerRef}
            auctionEndTime={product?.auction?.endTime}
            onTimerEnd={() => setBiddingClosed(true)} // Set biddingClosed on timer end
          />
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
                  const isMe = bid.bidderName === currentUser;
                  const isHighest = index === 0;
                  let textColorClass = "text-gray-800";
                  if (isMe) textColorClass = "text-blue-600 font-semibold";
                  if (isHighest && !isMe)
                    textColorClass = "text-green-600 font-semibold";
                  if (isHighest && isMe)
                    textColorClass = "text-purple-600 font-bold";
                  return (
                    <li
                      key={index}
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

      {/* Bid Result Modal */}
      <BidResultModal
        isOpen={showModal}
        onOpenChange={(open) => setShowModal(open)}
        // Pass the data received from the check-result API
        bidApiMessage={bidApiMessage}
        bidApiWinningAmount={bidApiWinningAmount}
        bidApiCheckoutUrl={bidApiCheckoutUrl}
      />
    </div>
  );
};

export default PlaceBid;
