import React, {useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [product,setProduct]=useState({});

  // Extract auctions from state passed from Navbar
  const { auctions } = location.state || { auctions: [] };

  if (!auctions.length) {
    return (
      <div className="w-full max-w-[1400px] mx-auto py-8 text-center">
        <h2 className="text-3xl font-bold">No Auctions Found</h2>
        <p className="mt-2 text-lg">Please try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Search Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction) => {
          const firstProduct = auction.products?.[0]; // safeguard

          return (
            <div
              key={auction.id}
              className="bg-white p-4 rounded-md shadow-md hover:shadow-lg transition-all"
            >
              {firstProduct && (
                <div className="relative">
                  <img
                    src={firstProduct.imageUrl}
                    alt={firstProduct.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                    {firstProduct.category}
                  </div>
                </div>
              )}
              <h3 className="text-xl font-semibold truncate">
                {auction.product?.name}
              </h3>
              <p className="text-gray-500 text-sm mt-2">
                Starting Price: ${auction.startingPrice}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Current Price: ${auction.currentPrice}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Status: {auction.status}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/product/${auction.id}`)}
                  className="text-blue-600 hover:text-blue-800 transition-all"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchResultsPage;
