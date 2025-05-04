import React, { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedImage from "../components/ui/AnimatedImage";
<<<<<<< HEAD
import ProductService from "../services/ProductService";  // assuming the service import
=======
import ProductService from "../services/ProductService";  

>>>>>>> Development

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the API
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await ProductService.getAll();

      // Extract ReturnObject array from the response
      if (Array.isArray(response.data.ReturnObject)) {
        setProducts(response.data.ReturnObject); // Correctly set products
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
}, []);

  return (
    <div className="container mx-auto px-4 pt-5">
      <AnimatedImage />

      {/* Popular Products Section */}
      <div className="popular-products p-6">
<<<<<<< HEAD
        <h2 style={{ fontFamily: "var(--font-roboto)" }} className="text-dark text-xl font-semibold mb-4">
=======
        <h2
          style={{ fontFamily: "var(--font-roboto)" }}
          className="text-dark text-xl font-semibold mb-4"
        >
>>>>>>> Development
          Popular Products
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
<<<<<<< HEAD
              <Card key={product.id || product.name} className="shadow-lg"> {/* Ensuring unique key */}
=======
              <Card key={product.id || product.name} className="shadow-lg">
                {" "}
                {/* Ensuring unique key */}
>>>>>>> Development
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
                <CardContent className="p-4">
                  <CardTitle>{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

<<<<<<< HEAD
      {/* Other Sections */}
      {/* Repeat similar structure for upcoming-auctions and live-auctions */}
      {/* Ensure products data is used correctly for those sections too */}
=======
      {/* Live */}
      <div className="popular-products p-6">
        <h2
          style={{ fontFamily: "var(--font-roboto)" }}
          className="text-dark text-xl font-semibold mb-4"
        >
          Live Products
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id || product.name} className="shadow-lg">
                {" "}
                {/* Ensuring unique key */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
                <CardContent className="p-4">
                  <p
                    style={{ fontFamily: "var(----font-tenor)" }}
                    className="text-md text-black  pb-3 font-bold "
                  >
                    LIVE NOW
                  </p>

                  <CardTitle>{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <Button className="px-6 py-2 bg-blue-500 text-white rounded-md shadow-lg hover:bg-blue-600">
                    View
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Live */}
      <div className="popular-products p-6">
        <h2
          style={{ fontFamily: "var(--font-roboto)" }}
          className="text-dark text-xl font-semibold mb-4"
        >
          Scheduled Products
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
          </div>
        )}
      </div>
>>>>>>> Development
    </div>
  );
};

export default Home;
