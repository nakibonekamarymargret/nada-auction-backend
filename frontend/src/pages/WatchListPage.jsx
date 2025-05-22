// src/components/WatchlistPage.js (or your preferred path)
import React, { useState, useEffect, useCallback } from "react";
import ProductService from "../services/ProductService.js";
import { Link, useNavigate } from "react-router-dom"; // For navigation
import { FaTrash } from "react-icons/fa"; // For a remove button

// Assume you have a way to get the auth token
const getAuthToken = () => {
  // Replace with your actual token retrieval logic
  return localStorage.getItem("token");
};

const WatchlistPage = () => {
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const authToken = getAuthToken();

  const fetchWatchlist = useCallback(async () => {
    if (!authToken) {
      setError("You must be logged in to view your watchlist.");
      setIsLoading(false);
      // Optionally redirect to login: navigate("/login");
      return;
    }
    setIsLoading(true);
    try {
      const response = await ProductService.getUserWatchlist(authToken);
      // Your backend returns: { status: 200, ReturnObject: watchlist, ... }
      // And ProductDto has: id, name, description, currentPrice, imageUrl, category, auction (AuctionDto)
      setWatchlistItems(response.data.ReturnObject || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch watchlist:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load watchlist. Please try again."
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Unauthorized or Forbidden
        setError("Session expired or unauthorized. Please log in again.");
        // navigate("/login");
      }
      setWatchlistItems([]); // Clear items on error
    } finally {
      setIsLoading(false);
    }
  }, [authToken, navigate]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleRemoveFromWatchlist = async (productId) => {
    if (!authToken) {
      alert("Please log in to modify your watchlist.");
      return;
    }
    try {
      // The toggle endpoint will remove it if it's already there
      await ProductService.toggleWatchlist(productId, authToken);
      // Refetch the watchlist to update the UI
      fetchWatchlist();
      // Or, optimistically update the UI:
      // setWatchlistItems(prevItems => prevItems.filter(item => item.id !== productId));
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
      alert(
        err.response?.data?.message ||
          "Could not remove item. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 text-center ">
        Loading your watchlist...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (watchlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 text-center font-tenor">
        <h1 className="text-2xl font-semibold mb-4">My Watchlist</h1>
        <p>You have no saved products in your watchlist yet.</p>
        <Link
          to="/"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 font-tenor mt-27">
      <h1
        className="text-3xl font-bold mb-6 text-gray-800"
        style={{ fontFamily: "'var(--font-playfair)'" }}
      >
        My Watchlist
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
        {watchlistItems.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg shadow-lg overflow-hidden bg-white"
          >
            <Link to={`/product/${product.id}`}>
              <img
                src={product.imageUrl || "placeholder-image.jpg"}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </Link>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 text-gray-700 hover:text-blue-600">
                <Link to={`/product/${product.id}`}>{product.name}</Link>
              </h2>
              <p
                className="text-gray-600 text-sm mb-1 truncate"
                title={product.description}
              >
                {product.description
                  ? product.description.substring(0, 70) + "..."
                  : "No description"}
              </p>
              <p className="text-lg font-bold text-green-600 mb-3">
                {product.highestPrice
                  ? `$${product.highestPrice.toFixed(2)}`
                  : product.auction?.startingPrice
                  ? `Starts at $${product.auction.startingPrice.toFixed(2)}`
                  : "Price N/A"}
              </p>
              <div className="flex justify-between items-center">
                <Link
                  to={`/product/${product.id}`}
                  className="text-[#008080] hover:text-[#008080] font-medium text-sm py-2 px-3 rounded bg-[#008080] 
                  hover:bg-[#009181] transition-colors"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleRemoveFromWatchlist(product.id)}
                  title="Remove from watchlist"
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                >
                  <FaTrash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchlistPage;
