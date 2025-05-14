import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

const PlaceBid = () => {
    const { id: productId } = useParams();
    const [amount, setAmount] = useState('');
    const [product, setProduct] = useState(null);
    // This state will hold the PROCESSED list of unique participants with highest bids
    const [participants, setParticipants] = useState([]);
    // State to control form visibility
    const [showBidForm, setShowBidForm] = useState(false);
    const token = localStorage.getItem("token");
    // State to store the logged-in user's identifier (email from token)
    const [currentUserIdentifier, setCurrentUserIdentifier] = useState(null); // Renamed for clarity
    const stompClient = useRef(null);
    const connectedRef = useRef(false);

    // Effect to decode token and set current user identifier
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                // Decode the token to get user info (assuming 'sub' is the unique identifier, likely email)
                const decodedToken = jwtDecode(storedToken);
                setCurrentUserIdentifier(decodedToken.sub); // Use 'sub' for identifier
            } catch (error) {
                console.error("Failed to decode token:", error);
                setCurrentUserIdentifier(null);
                // Optionally clear token from local storage and trigger re-login
            }
        } else {
            setCurrentUserIdentifier(null);
        }
    }, [token]); // Depend on the token variable


    // Helper function to get the minimum required bid amount string
    const getMinBidAmountString = (product) => {
        const lastBid = product?.lastBidAmount;
        const startPrice = product?.auction?.startingPrice || 0.00; // Use 0.00 as default
        const calculatedMin = lastBid ? Number(lastBid) + 0.01 : Number(startPrice) > 0 ? Number(startPrice) : 0.01;
        return Math.max(calculatedMin, 0.01).toFixed(2); // Ensure minimum is always at least 0.01
    };

    // Helper function to process the list of bids (now just adds "(me)" tag and sorts)
    // Assumes input 'bidsList' is already the processed list from the backend
    const processAndSortParticipants = (bidsList, currentUserIdentifier) => {
        if (!Array.isArray(bidsList)) {
            console.warn("Attempted to process non-array bidsList:", bidsList);
            return []; // Return empty array if input is not an array
        }

        return bidsList
            .map(bid => ({
                ...bid, // Keep all bid properties (id, amount, bidderName, bidderEmail, bidTime)
                // Compare bid.bidderEmail (from backend DTO) to currentUserIdentifier (from token's sub)
                displayName: (bid.bidderEmail && currentUserIdentifier && bid.bidderEmail === currentUserIdentifier)
                    ? `${bid.bidderName || 'Anonymous'} (me)` // Add (me) tag
                    : bid.bidderName || 'Anonymous' // Just display name
            }))
            // Sort by amount descending (ensure amount is treated as number)
            .sort((a, b) => (a.amount != null ? Number(a.amount) : 0) - (b.amount != null ? Number(b.amount) : 0));
        // Correct sort for descending:
        // .sort((a, b) => (b.amount != null ? Number(b.amount) : 0) - (a.amount != null ? Number(a.amount) : 0));

    };


    const fetchProductDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:7107/product/${productId}`);
            const productData = res.data.ReturnObject; // Assuming product data is here
            setProduct(productData);
            // Do NOT set amount here anymore. Amount is managed by user input or the dedicated effect below.

        } catch (err) {
            console.error("Failed to fetch product data:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to fetch product details.",
            });
            setProduct(null); // Set product to null on error
        }
    };

    const fetchParticipantsHttp = async () => {
        console.log("Fetching participants via HTTP. Token:", token);
        // Fetch only if token is available (implies user is logged in)
        if (!token) {
            console.warn("No token available for fetching participants via HTTP.");
            setParticipants([]); // Clear participants if no token
            return;
        }

        try {
            const res = await axios.get(
                `http://localhost:7107/bids/product/${productId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Raw bids list from HTTP backend:", res.data); // Should be the processed list now

            // Assuming the backend now returns the PROCESSED list directly at res.data.ReturnObject
            // based on the previous fix, or nested at res.data.ReturnObject.ReturnObject
            const rawBidsList = res.data.ReturnObject; // Assuming this is the list based on previous successful fetch example
            // Or if ResponseService still nests:
            // const rawBidsList = res.data.ReturnObject?.ReturnObject; // Use this if nesting persists

            if (rawBidsList) {
                // Process the list received from backend (add (me) tag, re-sort client-side for safety)
                const processedList = processAndSortParticipants(rawBidsList, currentUserIdentifier);
                setParticipants(processedList);
            } else {
                console.warn("Bids list not found in HTTP response:", res.data);
                setParticipants([]);
            }


        } catch (err) {
            console.error("Failed to fetch participants:", err.response?.data || err.message);
            if (err.response?.status === 401) {
                console.error("Authentication failed for fetching participants via HTTP.");
                // TODO: Handle 401 (e.g., clear token, redirect)
            }
            setParticipants([]); // Clear participants on error
        }
    };

    // --- Effects ---

    // Effect 1: Fetch product details on mount/productId change
    useEffect(() => {
        fetchProductDetails();
    }, [productId]);


    // Effect 2: Set initial input amount *after* product details are loaded
    // This runs when 'product' state changes (e.g., after fetchProductDetails completes)
    useEffect(() => {
        if (product) {
            // Set initial amount to the calculated minimum bid
            setAmount(getMinBidAmountString(product));
        }
    }, [product]); // Depend on the product state


    // Effect 3: Fetch participants and set up WebSocket connection
    // Depends on productId, token, and currentUserIdentifier (ensures token decoded)
    useEffect(() => {
        // Connect only if productId, token, AND currentUserIdentifier are available
        if (!productId || !token || currentUserIdentifier === null) {
            if (currentUserIdentifier === null && token) {
                // Waiting for token decoding... do nothing yet
            } else {
                // Not logged in or missing product ID
                console.warn("Skipping WebSocket connect/HTTP fetch: Missing productId, token, or currentUserIdentifier.");
            }
            setParticipants([]); // Clear participants if criteria not met
            return;
        }

        // Fetch participants via HTTP immediately when logged in and product/token available
        fetchParticipantsHttp();

        // Set up WebSocket connection
        const connect = () => {
            // Re-fetch token here just in case (though useEffect dependency should cover it)
            const currentToken = localStorage.getItem("token");
            if (!currentToken) {
                console.error("Cannot connect to WebSocket: Auth token not found during connect attempt.");
                connectedRef.current = false;
                // Consider stopping reconnect attempts or redirecting
                return;
            }

            const socket = new SockJS(`http://localhost:7107/ws?authToken=${currentToken}`);
            const client = Stomp.over(socket);

            // Optional: Silence STOMP debug logs if too noisy
            client.debug = () => {}; // Uncomment to silence logs

            client.connect({}, (frame) => {
                console.log("WebSocket connected:", frame);
                connectedRef.current = true;
                stompClient.current = client;

                // Subscribe to the correct topic
                client.subscribe(`/topic/bids/${productId}`, (message) => {
                    console.log('WebSocket message received:', message.body);
                    try {
                        // ASSUMING backend now sends the PROCESSED LIST via WS
                        const processedBidsList = JSON.parse(message.body); // Expecting a list of processed bid objects

                        // Process the list received from backend (add (me) tag, re-sort client-side for safety)
                        const finalProcessedList = processAndSortParticipants(processedBidsList, currentUserIdentifier);
                        setParticipants(finalProcessedList);

                        // Update product.lastBidAmount display based on the received list's highest bid
                        if (finalProcessedList.length > 0) {
                            const newHighestBidAmount = finalProcessedList[0].amount;
                            setProduct(prevProduct => {
                                // Only update if the received highest is actually greater
                                const currentHighestDisplay = prevProduct?.lastBidAmount != null ? Number(prevProduct.lastBidAmount) : Number(prevProduct?.auction?.startingPrice || 0);
                                if (newHighestBidAmount > currentHighestDisplay) {
                                    console.log("WS: Updating product highest bid display.");
                                    // Need to create a new product object to trigger state update
                                    return {
                                        ...prevProduct,
                                        lastBidAmount: newHighestBidAmount,
                                        // If backend sends lastBidTime in the list, update that too
                                        // lastBidTime: finalProcessedList[0].bidTime
                                    };
                                }
                                return prevProduct; // No change to product state needed
                            });
                            // The input amount will auto-update via Effect 4 when product.lastBidAmount changes

                        } else {
                            // Case where WS sends an empty list (e.g., all bids retracted?)
                            setProduct(prevProduct => {
                                if (!prevProduct) return null;
                                // Reset highest bid display to starting price if list is empty
                                return { ...prevProduct, lastBidAmount: Number(prevProduct.auction?.startingPrice || 0) };
                            });
                            // The input amount will auto-update via Effect 4
                        }


                    } catch(e) {
                        console.error("Error processing WebSocket message:", e);
                        // Fallback: re-fetch participants via HTTP if WS message processing fails
                        fetchParticipantsHttp();
                    }
                }, (error) => {
                    // Error callback for connection - fires on failure like 401
                    console.error('WebSocket connection error:', error);
                    connectedRef.current = false;
                    stompClient.current = null; // Clear client on failure
                    // Optional: try to reconnect after a delay
                    console.log("Attempting to reconnect in 5 seconds...");
                    setTimeout(connect, 5000);
                });
            });
        };

        // Initiate connection attempt
        connect();

        // Cleanup function for WebSocket disconnection
        return () => {
            if (stompClient.current && connectedRef.current) {
                console.log("Disconnecting from WebSocket...");
                try {
                    // Use a small timeout for graceful disconnect
                    stompClient.current.disconnect(() => { console.log("WebSocket disconnected successfully."); }, 1000);
                } catch (e) {
                    console.error("Error during WebSocket disconnect:", e);
                }
            }
            stompClient.current = null; // Ensure ref is cleared on cleanup
            connectedRef.current = false;
        };
        // Depend on productId, token, and currentUserIdentifier to re-run if they change
    }, [productId, token, currentUserIdentifier]);


    // Effect 4: Update input amount when product's lastBidAmount changes (triggered by WS update)
    useEffect(() => {
        if (product) {
            // Set the input amount to the new minimum bid based on the updated highest bid
            setAmount(getMinBidAmountString(product));
        }
    }, [product?.lastBidAmount]); // Depend specifically on lastBidAmount


    const handleSubmitBid = async (e) => {
        e.preventDefault();
        const bidValue = Number(amount);
        const minBid = Number(getMinBidAmountString(product)); // Get latest min bid

        // Basic validation
        if (isNaN(bidValue) || bidValue < minBid) { // Use < minBid as per requirement
            Swal.fire({
                icon: "warning",
                title: "Invalid Bid",
                text: `Your bid must be at least $${minBid}.`,
            });
            return;
        }

        // Add check if product is closed before submitting
        if (product?.isClosed) {
            Swal.fire({
                icon: "warning",
                title: "Bidding Closed",
                text: "Bidding is already closed for this product.",
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

            // Assuming success response structure includes a message
            const successMessage = res.data?.ReturnObject?.message || res.data?.message || "Bid placed successfully!";

            Swal.fire({
                icon: "success",
                title: "Success",
                text: successMessage,
            });



            setShowBidForm(false); // Hide the form after placing bid

        } catch (err) {
            console.error("Error placing bid:", err.response?.data || err.message);
            const msg = err.response?.data?.returnMessage || err.response?.data?.ReturnObject?.message || err.message || "Failed to place bid.";
            Swal.fire({ icon: "error", title: "Error", text: msg });

            // If placing bid fails, re-fetch product details to get latest state/highest bid
            fetchProductDetails();
            // Also re-fetch participants in case the list was stale
            fetchParticipantsHttp();
        }
    };

    // Increment button handler (for the input field)
    const incrementBid = () => {
        const currentAmount = Number(amount);
        // Calculate minimum bid based on current product state
        const minAllowedBid = Number(getMinBidAmountString(product));

        let newAmount = currentAmount + 1; // Increment by 1

        // Ensure the new amount is not less than the current minimum bid + 0.01
        // This handles cases where incrementing from below min bid might not reach min+0.01
        if (newAmount < minAllowedBid) {
            newAmount = minAllowedBid; // Or minAllowedBid + 0.01 if increment must strictly be above min
        }

        // Prevent NaN if currentAmount was NaN or calculation failed
        if (isNaN(newAmount)) newAmount = minAllowedBid; // Reset to min bid

        setAmount(newAmount.toFixed(2)); // Update input state
    };

    // Cancel button handler
    const handleCancelBid = () => {
        // Reset amount to current min bid and hide the form
        setAmount(getMinBidAmountString(product));
        setShowBidForm(false);
    };

    // --- Render Logic ---

    // Show loading state if product data is not yet loaded
    if (!product) {
        return (
            <div className="container mx-auto p-4 text-center">
                <p>Loading product details...</p>
            </div>
        );
    }

    // Determine if bidding is closed
    const isBiddingClosed = product.isClosed;


    return (
        <div className="container mx-auto p-6">
            {/* Auction Room Title (Uses auction title) */}
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                Auction Room: {product?.auction?.title || 'Loading Auction Title...'}
            </h2>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {/* Left Column - Product Info & Bid Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-full">
                    <img
                        src={product.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"}
                        alt={product.name || "Product Image"}
                        className="w-full h-60 object-cover rounded-lg mb-4 shadow-md"
                    />
                    <div className="flex-grow">
                        {/* Product Name & Description */}
                        <h3 className="text-xl font-semibold text-gray-800">{product.name || 'Product Name'}</h3>
                        <p className="text-gray-600 mt-2 mb-4">{product.description || "No description available."}</p>

                        {/* Current Highest Bid Display */}
                        <p className="mt-2 text-lg font-bold text-green-600">
                            Current Highest Bid: ${product.lastBidAmount?.toFixed(2) || (product.auction?.startingPrice?.toFixed(2) || '0.00')}
                        </p>

                        {/* Bidding Closed Status */}
                        {isBiddingClosed && (
                            <p className="text-red-600 font-bold mt-2">Bidding is CLOSED</p>
                        )}

                        {/* User's Current Input/Next Bid Price */}
                        {/* This displays what the user has entered or the calculated min bid */}
                        <div className="flex items-center mt-2">
                            <p className="text-lg font-bold text-blue-600">Your Next Bid: ${Number(amount).toFixed(2)}</p>
                            {/* Update button for the input amount */}
                            {/* <span onClick={incrementBid} className="ml-2 cursor-pointer text-xl text-blue-500 font-bold">+</span> */}
                            {/* Removed the '+' span next to "Your Next Bid" as the +$1 button is on the form */}
                        </div>


                        {/* Auction End Time */}
                        <p className="text-sm text-gray-500">
                            Auction Ends: {product.auction?.endTime ? new Date(product.auction.endTime).toLocaleString() : 'N/A'}
                        </p>
                    </div>

                    {/* Bid Actions Area (Show button or form) */}
                    <div className="mt-6">
                        {/* Show Place Bid button if form is hidden and bidding is open */}
                        {!showBidForm && !isBiddingClosed && (
                            <button
                                onClick={() => setShowBidForm(true)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200"
                            >
                                Place Bid
                            </button>
                        )}

                        {/* Message if bidding is closed and form is not shown */}
                        {isBiddingClosed && !showBidForm && (
                            <p className="text-red-600 font-bold text-center">Cannot place bid - Bidding is closed.</p>
                        )}

                        {/* Show the Bid Form if showBidForm is true and bidding is open */}
                        {showBidForm && !isBiddingClosed && (
                            <form onSubmit={handleSubmitBid}>
                                <div className="mb-4">
                                    <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
                                        Enter Your Bid Amount ($):
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            id="amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder={`Min: $${getMinBidAmountString(product)}`} // Show min bid in placeholder
                                            className="shadow border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            required
                                            min={getMinBidAmountString(product)} // Add min attribute for basic validation
                                            step="0.01" // Allow decimal bids
                                        />
                                        <button
                                            type="button"
                                            onClick={incrementBid}
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r transition duration-200"
                                        >
                                            +$1
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="submit"
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                                    >
                                        Place Bid
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelBid}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                        {/* Message if user is logged out or token invalid? */}
                        {/* Add logic here if bid actions should be hidden when not authenticated */}
                    </div>
                </div>

                {/* Right Column - Bidding Participants */}
                <div className="bg-gray-50 rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Bidding Participants</h3>
                    {participants.length === 0 ? (
                        <p className="text-gray-500 text-center">No bids yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {/* Map over the PROCESSED list of unique participants */}
                            {participants.map((participant, index) => ( // Use 'participant' not 'bid'
                                <li
                                    // Use a more stable key if possible (like bid ID or bidder email if unique)
                                    // Since this is processed, bidderEmail is the best unique key if available
                                    key={participant.bidderEmail || participant.bidderName || `idx-${index}`}
                                    className="flex justify-between items-center p-3 bg-white shadow rounded-md"
                                >
                                    {/* Display name includes (me) tag */}
                                    <span className="font-medium text-gray-700">
                                        {participant.displayName}
                                    </span>
                                    {/* Display the amount */}
                                    <span className="text-green-600 font-bold">
                                        ${participant.amount != null ? participant.amount.toFixed(2) : '0.00'}
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