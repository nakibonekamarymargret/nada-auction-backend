import React, { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import AnimatedImage from "../components/ui/AnimatedImage";
import ProductService from "../services/ProductService";
import { useNavigate } from "react-router-dom";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState({
    SCHEDULED: false,
    LIVE: false,
    CLOSED: false,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await ProductService.getAll();
        if (Array.isArray(response.data.ReturnObject)) {
          setProducts(response.data.ReturnObject);
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    const intervalId = setInterval(fetchProducts, 60000); // Poll every minute
    return () => clearInterval(intervalId);
  }, []);

  const handleViewProduct = (id) => {
    navigate(`/product/${id}`);
  };

  const getProductsByStatus = (status) => {
    return products
      .filter((p) => p.auction && p.auction.status === status)
      .sort((a, b) => {
        const aStartTime = new Date(a.auction?.startTime || "");
        const bStartTime = new Date(b.auction?.startTime || "");

        // Prioritize "Live Now" products
        if (a.auction.status === "LIVE" && b.auction.status !== "LIVE") {
          return -1;
        }
        if (b.auction.status === "LIVE" && a.auction.status !== "LIVE") {
          return 1;
        }

        // Sort by auction start time
        return aStartTime - bStartTime;
      });
  };

  const toggleSection = (status) => {
    setExpandedSections((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };
  const renderProducts = (filteredProducts, status) => {
    if (loading) return <p>Loading...</p>;
    if (!filteredProducts.length) return <p>No products found.</p>;

    const isExpanded = expandedSections[status];
    const displayedProducts = isExpanded
      ? filteredProducts
      : filteredProducts.slice(0, 6);
    const showButton = filteredProducts.length > 6;

    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => {
            const now = new Date();
            const startTime = product?.auction?.startTime
              ? new Date(product.auction.startTime)
              : null;
            const auctionStatus = product?.auction?.status;

            let label = "";

            if (auctionStatus === "LIVE") {
              label = "Live Now";
            } else if (auctionStatus === "SCHEDULED" && startTime) {
              const startDate = startTime.toDateString();
              const today = now.toDateString();
              const tomorrow = new Date(now);
              tomorrow.setDate(now.getDate() + 1);
              const tomorrowDate = tomorrow.toDateString();

              if (startDate === today) {
                label = "Live Today";
              } else if (startDate === tomorrowDate) {
                label = "Live Tomorrow";
              } else {
                label = "Upcoming";
              }
            }

            return (
              <Card
                key={product.id || product.name}
                className="shadow-lg cursor-pointer hover:shadow-xl transition duration-300 border rounded-lg overflow-hidden"
                onClick={() => handleViewProduct(product.id)}
              >
                <div className="w-full h-56 relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-t-md"
                  />
                  {/* Optional: Add a gradient overlay for better readability */}
                  <div className="absolute inset-0 bg-black/50"></div>
                </div>
                <CardContent className="p-4 space-y-2">
                  {label && (
                    <p
                      className="text-lg text-blue-600 font-bold mb-1"
                      style={{ fontFamily: "var(----font-tenor)" }}
                    >
                      {label}
                    </p>
                  )}
                  <CardTitle className="text-lg font-semibold mb-2 truncate">
                    {product.name}
                  </CardTitle>
                  <p
                    className="text-base text-gray-700 line-clamp-2"
                    style={{ fontFamily: "var(--font-roboto)" }}
                  >
                    {product.description.split(".")[0]}...
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {showButton && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => toggleSection(status)}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-300 px-4 py-2 rounded-md transition"
            >
              <span className="text-white">
                {isExpanded ? "Show Less" : "Show More"}
              </span>
              {isExpanded ? (
                <FaAngleUp className="text-white" />
              ) : (
                <FaAngleDown className="text-white" />
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 pt-5">
      <AnimatedImage />

      {/* Upcoming Products */}
      <section className="p-6">
        <h2
          className="text-gray-500 text-3xl font-semibold mb-4"
          style={{ fontFamily: "var(--font-roboto)" }}
        >
          Upcoming Products
        </h2>
        {renderProducts(getProductsByStatus("SCHEDULED"), "SCHEDULED")}
      </section>

      {/* Live Products */}
      <section className="p-6">
        <h2
          className="text-gray-500 text-3xl font-semibold mb-4"
          style={{ fontFamily: "var(--font-roboto)" }}
        >
          Live Products
        </h2>
        {renderProducts(getProductsByStatus("LIVE"), "LIVE")}
      </section>

      {/* Closed Products */}
      <section className="p-6">
        <h2
          className="text-dark text-xl font-semibold mb-4"
          style={{ fontFamily: "var(--font-roboto)" }}
        >
          Closed Products
        </h2>
        {renderProducts(getProductsByStatus("CLOSED"), "CLOSED")}
      </section>
    </div>
  );
};

export default Home;
