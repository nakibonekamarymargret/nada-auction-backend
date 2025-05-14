import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const PlaceBid = () => {
    const { id: productId } = useParams();
    const [amount, setAmount] = useState(0);
    const [product, setProduct] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showAmountInput, setShowAmountInput] = useState(false);
    const [hasPlacedBid, setHasPlacedBid] = useState(false);

    const token = localStorage.getItem("token");
    const stompClient = useRef(null);
    const connectedRef = useRef(false);

    useEffect(() => {
        if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setCurrentUser(payload?.sub);
        }

        const placed = localStorage.getItem(`bid_${productId}`);
        if (placed) setHasPlacedBid(true);
    }, [token, productId]);

    useEffect(() => {
        if (hasPlacedBid) {
            localStorage.setItem(`bid_${productId}`, "true");
        }
    }, [hasPlacedBid, productId]);

    const getMinBid = (product) => {
        const lastBid = product?.lastBidAmount;
        const startPrice = product?.auction?.startingPrice || 0.01;
        return lastBid ?? startPrice;
    };

    const fetchProductDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:7107/product/${productId}`);
            const productData = res.data.ReturnObject;
            setProduct(productData);
            setAmount(getMinBid(productData));
        } catch (err) {
            console.error("Failed to fetch product:", err);
        }
    };

    const fetchParticipantsHttp = async () => {
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
    };

    const deduplicateAndSort = (bids) => {
        const latestBids = new Map();
        bids.forEach((bid) => {
            const existing = latestBids.get(bid.bidderName);
            if (!existing || bid.amount > existing.amount) {
                latestBids.set(bid.bidderName, bid);
            }
        });
        return Array.from(latestBids.values()).sort((a, b) => b.amount - a.amount);
    };

    const fetchMyLatestBid = async () => {
        try {
            const res = await axios.get(`http://localhost:7107/bids/my-latest/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const myBid = res.data.ReturnObject;
            const amountValue = parseFloat(myBid?.bid?.amount);

            if (!isNaN(amountValue)) {
                setAmount(amountValue);
                setHasPlacedBid(true);
            } else {
                setAmount(getMinBid(product));
            }
        } catch {
            setAmount(getMinBid(product));
        }
    };

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    useEffect(() => {
        if (product && token) {
            fetchMyLatestBid();
        }
    }, [product, token]);

    useEffect(() => {
        if (!productId || !token) return;

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
                        const bids = JSON.parse(message.body);
                        const latest = deduplicateAndSort(bids);
                        setParticipants(latest);

                        // 🟢 Update product highestPrice & lastBid
                        if (latest.length > 0) {
                            const topBid = latest[0];
                            setProduct((prev) => ({
                                ...prev,
                                highestPrice: topBid.amount,
                                lastBidAmount: topBid.amount,
                            }));
                        }

                        // 🟢 Update user's bid amount if present
                        if (currentUser) {
                            const myBid = latest.find((b) => b.bidderName === currentUser);
                            if (myBid) {
                                setAmount(myBid.amount);
                                setHasPlacedBid(true);
                            }
                        }
                    });

                    fetchParticipantsHttp();
                },
                (error) => {
                    console.error("WebSocket connection error:", error);
                    setTimeout(connect, 5000); // Retry on failure
                }
            );
        };

        connect();

        return () => {
            if (stompClient.current && connectedRef.current) {
                stompClient.current.disconnect();
            }
        };
    }, [productId, token, currentUser]);

    const isAuctionOver = product?.auction?.endTime
        ? new Date(product.auction.endTime) < new Date()
        : false;

    const handleSubmitBid = async (e) => {
        e.preventDefault();
        const bidValue = Number(amount);
        const minBid = getMinBid(product);

        if (isNaN(bidValue) || bidValue < minBid) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Bid",
                text: `Your bid must be at least $${minBid.toFixed(2)}.`,
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
                text: res.data.ReturnObject?.message || "Bid placed successfully!",
            });

            setHasPlacedBid(true);
            setShowForm(false);
            setShowAmountInput(false);

            // Optional immediate UI feedback
            setParticipants((prev) => deduplicateAndSort([...prev, {
                bidderName: currentUser,
                amount: bidValue,
            }]));

            setProduct((prev) => ({
                ...prev,
                highestPrice: bidValue,
                lastBidAmount: bidValue,
            }));

        } catch {
            Swal.fire({ icon: "error", title: "Error", text: "Failed to place bid." });
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

    if (!product) return <div className="p-4">Loading product details...</div>;

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-bold mb-6 text-center">
                Auction Room: {product.auction?.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <img
                        src={product.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"}
                        alt={product.name}
                        className="w-full h-60 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    <p className="text-gray-600 mt-2 mb-4">{product.description || "No description available."}</p>
                    <p className="text-xl font-bold text-gray-800 mt-2">
                        Current Highest Bid:{" "}
                        {product.highestPrice ? `$${product.highestPrice.toFixed(2)}` : "No bids yet"}
                    </p>

                    <div className="flex items-center space-x-2 mt-3">
                        {!showAmountInput ? (
                            <>
                                <p className="text-lg font-bold text-green-600">
                                    My Bid Price: ${amount.toFixed(2)}
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

                    {!isAuctionOver && !showForm && !hasPlacedBid && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                        >
                            Place Bid
                        </button>
                    )}

                    {isAuctionOver && (
                        <p className="text-red-600 font-bold mt-6">Auction has ended. Bidding is closed.</p>
                    )}

                    {!isAuctionOver && showForm && (
                        <form onSubmit={handleSubmitBid} className="mt-6">
                            <div className="mb-4">
                                <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
                                    Your Bid Amount ($):
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
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
                </div>

                <div className="bg-gray-50 rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4 text-center">Bidding Participants</h3>
                    {participants.length === 0 ? (
                        <p className="text-gray-500 text-center">No bids yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {participants.map((bid, index) => (
                                <li key={index} className="flex justify-between p-3 bg-white shadow rounded">
                                    <span className="font-medium">
                                        {bid.bidderName}
                                        {bid.bidderName === currentUser && (
                                            <span className="text-sm text-blue-500"> (me)</span>
                                        )}
                                    </span>
                                    <span className="text-green-600 font-bold">
                                        ${bid.amount.toFixed(2)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlaceBid;
