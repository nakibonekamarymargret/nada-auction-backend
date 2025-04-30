import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const productData = [
  {
    id: 1,
    title: "Leather Bag",
    image: "/images/leatherbag.jpg",
    description: "Classy and chicky leather bag to fit your style",
  },
  {
    id: 2,
    title: "Smartwatch",
    image: "/images/smartwatch.jpg",
    description: "Stylish smartwatch with health tracking features.",
  },
  {
    id: 3,
    title: "Camera",
    image: "/images/camera.jpg",
    description: "Capture memories with this professional DSLR camera.",
  },
  {
    id: 4,
    title: "Speaker",
    image: "/images/speakers.jpg",
    description: "Portable Bluetooth speaker with crystal-clear sound.",
  },
  {
    id: 5,
    title: "Dell Laptop",
    image: "/images/dell.jpeg",
    description: "High-quality powerfull dell pc you need for all your life.",
  },
];

const Home = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex w-full h-98 p-4">
        <img
          src="/bg1.jpg"
          alt="Background"
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      <div className="popular-products p-6">
        <h2
          style={{ fontFamily: "var(--font-roboto)" }}
          className="text-dark text-xl font-semibold mb-4"
        >
          Popular Products
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-6">
          {productData.map((product) => (
            <Card key={product.id} className="shadow-lg">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <CardContent className="p-4">
                <CardTitle>{product.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="upcoming-auctions p-6">
        <h2
          style={{ fontFamily: "var(----font-baskerville)" }}
          className="text dark text-xl font-semibold mb-4"
        >
          Scheduled Auctions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:grid-cols-4">
          {productData.map((product) => (
            <Card key={product.id} className="shadow-lg">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <CardContent className="p-4">
                <CardTitle>{product.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {product.description}
                </p>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4  mt-3">
                  View 
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="live-auctions p-6">
        <h2
          style={{ fontFamily: "var(----font-baskerville)" }}
          className="text dark text-xl font-semibold mb-4"
        >
          Live Auctions
        </h2>
        <div className="grid grid-cols-1 sm:grid-ols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productData.map((product) => (
            <Card key={product.id} className="shadow-lg">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <CardContent className="p-4">
                <CardTitle>{product.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {product.description}
                </p>
                <Button className="mt-3">View Auction</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
