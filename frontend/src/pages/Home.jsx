import React, { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import AnimatedImage from "../components/ui/AnimatedImage";
import ProductService from "../services/ProductService";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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

  // Fetch initially
  fetchProducts();

  // Poll every 60 seconds
  const intervalId = setInterval(fetchProducts, 60000); // 60,000ms = 1 minute

  // Cleanup
  return () => clearInterval(intervalId);
}, []);


  const handleViewProduct = (id) => {
    navigate(`/product/${id}`);
  };

  const getProductsByStatus = (status) => {
    return products.filter((p) => p.auction && p.auction.status === status);
  };

  const renderProducts = (filteredProducts) => {
    if (loading) return <p>Loading...</p>;
    if (!filteredProducts.length) return <p>No products found.</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const now = new Date();
          const startTime = product?.auction?.startTime
            ? new Date(product.auction.startTime)
            : null;

          let label = "";

          if (startTime) {
            const startDate = startTime.toDateString();
            const today = now.toDateString();
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            const tomorrowDate = tomorrow.toDateString();

            if (startDate === today) {
              label = now < startTime ? "Live Today" : "Live Now";
            } else if (startDate === tomorrowDate) {
              label = "Live Tomorrow";
            }
          }

          return (
            <Card
              key={product.id || product.name}
              className="shadow-lg cursor-pointer hover:shadow-xl transition"
              onClick={() => handleViewProduct(product.id)}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <CardContent className="p-4">
                {label && (
                  <p className="text-sm text-primary font-semibold mb-1">
                    {label}
                  </p>
                )}
                <CardTitle>{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 pt-5">
      <AnimatedImage />

      {/* Upcoming Products */}
      <section className="p-6">
        <h2
          className="text-dark text-xl font-semibold mb-4"
          style={{ fontFamily: "var(--font-roboto)" }}
        >
          Upcoming Products
        </h2>
        {renderProducts(getProductsByStatus("SCHEDULED"))}
      </section>

      {/* Live Products */}
      <section className="p-6">
        <h2
          className="text-dark text-xl font-semibold mb-4"
          style={{ fontFamily: "var(--font-roboto)" }}
        >
          Live Products
        </h2>
        {renderProducts(getProductsByStatus("LIVE"))}
      </section>

      {/* Closed Products */}
      <section className="p-6">
        <h2
          className="text-dark text-xl font-semibold mb-4"
          style={{ fontFamily: "var(--font-roboto)" }}
        >
          Closed Products
        </h2>
        {renderProducts(getProductsByStatus("CLOSED"))}
      </section>

      {/* Footer */}
      <section className="footer">
        <footer className="bg-black w-full">
          <div className="grid grid-col-1 flex justify-between p-4 items-center">
            <h2
              style={{ fontFamily: "var(--roboto)" }}
              className="text-white text-2xl font-bold"
            >
              NADA
            </h2>
            <p className="text-white">
              Millions of unique items are added to NADA each year from 700
              expert auction houses worldwide.
            </p>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default Home;
