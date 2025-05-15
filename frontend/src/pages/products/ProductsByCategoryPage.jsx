import React, { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card"; // Assuming Shadcn UI Card
import ProductService from "@/services/ProductService";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams

const ProductsByCategoryPage = () => {
  const { status: statusParam } = useParams(); // Get the status parameter from the URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate();

  // Map URL status param to user-friendly title and API status value
  const getCategoryInfo = (param) => {
    switch (param.toLowerCase()) {
      case "scheduled":
        return { title: "Upcoming Products", apiStatus: "SCHEDULED" };
      case "live":
        return { title: "Live Products", apiStatus: "LIVE" };
      case "closed":
        return { title: "Closed Products", apiStatus: "CLOSED" };
      default:
        return { title: "Unknown Category", apiStatus: null }; // Handle invalid status params
    }
  };

  const categoryInfo = getCategoryInfo(statusParam);
  const { title, apiStatus } = categoryInfo;

  useEffect(() => {
    // Only fetch if the status parameter is valid
    if (!apiStatus) {
      setError("Invalid product category specified.");
      setLoading(false);
      setProducts([]); // Ensure products is empty
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ProductService.getAll();
        if (
          response?.data?.ReturnObject &&
          Array.isArray(response.data.ReturnObject)
        ) {
          // Filter the fetched products by the API status value
          const filtered = response.data.ReturnObject.filter(
            (p) => p.auction && p.auction.status === apiStatus
          );
          setProducts(filtered);
        } else {
          console.error("Unexpected response format:", response.data);
          setProducts([]);
          setError("Received unexpected data format from the server.");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products. Please try again later.");
        setProducts([]); // Ensure products is empty on error
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // NOTE: No polling needed on this page usually, as the user would expect a snapshot.
    // If polling is desired, you'd add setInterval/clearInterval here like in Home.
    // Cleanup function is not strictly necessary without setInterval, but good practice if added later.
  }, [apiStatus]); // Re-run effect if the status parameter changes in the URL

  const handleViewProduct = (id) => {
    // Navigate to the single product detail page - reuse existing route
    navigate(`/product/${id}`);
  };

  // --- Card Rendering Logic (Copied/Adapted from Home) ---
  // We can reuse the card structure. No need for slicing here.
  const renderProducts = (productsToRender) => {
    if (!productsToRender || productsToRender.length === 0) {
      // Display a different message if the category is valid but has no products
      return (
        <p className="text-gray-600">
          No {title.toLowerCase()} found at this time.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productsToRender.map((product, index) => {
          const cardKey = product.id
            ? `product-${product.id}`
            : `product-${product.name}-${index}`;

          // Label logic is less critical on a full list page, but can be kept
          const now = new Date();
          const startTime = product?.auction?.startTime
            ? new Date(product.auction.startTime)
            : null;

          let label = "";
          const status = product?.auction?.status;

          // Only calculate relevant labels for scheduled/live
          if (status === "SCHEDULED" || status === "LIVE") {
            if (startTime) {
              const startDate = startTime.toDateString();
              const today = now.toDateString();
              const tomorrow = new Date(now);
              tomorrow.setDate(now.getDate() + 1);
              const tomorrowDate = tomorrow.toDateString();

              if (startDate === today) {
                label = now < startTime ? "Starts Today" : "Live Now";
              } else if (startDate === tomorrowDate) {
                label = "Starts Tomorrow";
              }
            }
          }
          // Add a label for Closed items if you want to visually distinguish them
          if (status === "CLOSED") {
            label = "Auction Closed"; // Example label for closed
          }

          return (
            <Card
              key={cardKey}
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col rounded-lg overflow-hidden"
              onClick={() => handleViewProduct(product.id)}
            >
              {product.imageUrl && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name || "Product Image"}
                    className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <CardContent className="p-4 flex-grow">
                {label && (
                  <p className="text-sm text-primary font-semibold mb-1">
                    {label}
                  </p>
                )}
                <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
                  {product.name}
                </CardTitle>
                {product.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                    {product.description}
                  </p>
                )}
                {/* Consider adding closed details here, e.g., final price */}
                {status === "CLOSED" && product.auction?.finalPrice && (
                  <p className="text-sm font-semibold text-gray-700 mt-2">
                    Final Price: ${product.auction.finalPrice.toFixed(2)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  // --- End of Card Rendering Logic ---

  // Render logic for the page
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Title */}
      <h1
        className="text-dark text-3xl font-bold mb-6 border-b pb-2"
        style={{ fontFamily: "var(--font-roboto), sans-serif" }}
      >
        {title}
      </h1>

      {/* Loading State */}
      {loading && (
        <p className="text-center text-lg">Loading {title.toLowerCase()}...</p>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center text-red-600 text-lg">
          <p>{error}</p>
          {/* Optional: Add a button to go back or retry */}
        </div>
      )}

      {/* Display Products or Empty State Message */}
      {!loading && !error && renderProducts(products)}

      {/* You might want a basic footer or reuse your main footer here */}
      {/* For simplicity in this example, the main footer from App.js or Layout could be used */}
    </div>
  );
};

export default ProductsByCategoryPage;
