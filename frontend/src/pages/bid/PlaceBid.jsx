import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2

const PlaceBid = () => {
    const { id: productId } = useParams(); // Get the product ID from the route
    const [amount, setAmount] = useState('');
    const [token] = useState(localStorage.getItem('token')); // Get the JWT token from localStorage
    const [product, setProduct] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:7107/product/${productId}`
        );
        const productData = res.data.ReturnObject;
        setProduct(productData);
      } catch (err) {
        console.error("Failed to fetch product data:", err);
        Swal.fire({
          // Use SweetAlert2
          icon: "error",
          title: "Error",
          text: "Failed to fetch product details.  Check the console for details.",
        });
      }
    };

    fetchProduct();
  }, [productId]);

// Fetch participants for the product
    const fetchParticipants = async () => {
        try {
            const res = await axios.get(`http://localhost:7107/bids/product/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParticipants(res.data.ReturnObject);
        } catch (err) {
            console.error("Failed to fetch participants:", err);
        }
    };

    fetchParticipants();

  const handleSubmitBid = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Swal.fire({
        // Use SweetAlert2
        icon: "warning",
        title: "Invalid Input",
        text: "Please enter a valid bid amount greater than zero.",
      });
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:7107/bids/place/${productId}`,
        { amount: Number(amount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Bid placed successfully:", response.data);
      Swal.fire({
        // Use SweetAlert2
        icon: "success",
        title: "Success",
        text: response.data.ReturnObject.message,
      });
      setAmount("");
    } catch (error) {
        console.error("Error placing bid:", error);
        let errorMessage = "Failed to place bid. Check the console for details.";
        if (
          error.response &&
          error.response.data &&
          error.response.data.returnMessage
        ) {
          errorMessage = error.response.data.returnMessage;
        }
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
        if (error.response) {
          console.error("Server Response:", error.response.data);
        }
      }
  };

  if (!product) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading product details...</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Auction Room: {product.name}
      </h2>

            {message && (
                <div
                    className={`mb-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Bid Form */}
                <div>
                    <img src={product.imageUrl || "placeholder.jpg"} alt={product.name}
                         className="w-full rounded-lg mb-4"/>
                    <p className="mb-4 text-gray-700">{product.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Side - Product Image and Info */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-4">
          <img
            src={product.imageUrl || "placeholder-image.jpg"}
            alt={product.name || "Product Image"}
            className="w-full h-72 object-cover rounded-lg mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-800">
            {product.name}
          </h3>
          <p className="text-gray-600 mt-2">{product.description}</p>
          <p className="mt-4 text-lg font-medium text-blue-600">
            Current Highest Bid: ${product.highestPrice?.toFixed(2) || 0}
          </p>
        </div>

                    <form onSubmit={handleSubmitBid}>
                        <label htmlFor="amount" className="block text-sm font-semibold mb-2">Bid Amount ($):</label>
                        <div className="flex mb-4">
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="flex-grow border rounded-l px-3 py-2"
                                min="0.01"
                                step="0.01"
                            />
                            <button
                                type="button"
                                onClick={() => setAmount((prev) => (Number(prev) + 1).toFixed(2))}
                                className="bg-gray-200 px-4 rounded-r hover:bg-gray-300"
                            >
                                +
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <button type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit
                            </button>
                            <button type="button" onClick={() => setAmount('')}
                                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Participants */}
                <div className="bg-white border rounded p-4 shadow-md">
                    <h3 className="text-lg font-bold mb-3">Participants</h3>
                    {participants.length === 0 ? (
                        <p>No bids yet.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {participants.map((p, index) => (
                                <li key={p.id} className="py-2 flex justify-between">
                                    <span>{index + 1}. {p.bidder?.name || 'Anonymous'}</span>
                                    <span className="font-semibold">${p.amount.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        {/* Right Side - Bid Form + WebSocket Stream */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between h-full">
          <form onSubmit={handleSubmitBid}>
            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Your Bid Amount ($):
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter your bid amount"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Place Bid
            </button>
          </form>

          {/* Live Bid Stream Placeholder */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Live Bidding Stream
            </h4>
            <div className="bg-gray-100 border border-dashed border-gray-300 rounded-md p-4 h-40 overflow-y-auto text-sm text-gray-700">
              {/* Insert your WebSocket updates here */}
              <p className="text-gray-400 italic">
                Waiting for live updates...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


};

export default PlaceBid;
