// import React, { useEffect, useState } from "react";
// import { Card, CardContent, CardTitle } from "@/components/ui/card"; // Assuming Shadcn UI Card
// import AnimatedImage from "../components/ui/AnimatedImage"; // Your existing component
// import ProductService from "../services/ProductService"; // Your existing service
// import { useNavigate } from "react-router-dom";

// const Home = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await ProductService.getAll();
//         // Check if response.data exists and has ReturnObject as an array
//         if (
//           response?.data?.ReturnObject &&
//           Array.isArray(response.data.ReturnObject)
//         ) {
//           setProducts(response.data.ReturnObject);
//         } else {
//           console.error("Unexpected response format:", response.data);
//           setProducts([]); // Ensure products is always an array
//         }
//       } catch (error) {
//         console.error("Error fetching products:", error);
//         setProducts([]); // Ensure products is always an array on error
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Fetch initially
//     fetchProducts();

//     // Poll every 60 seconds
//     const intervalId = setInterval(fetchProducts, 60000); // 60,000ms = 1 minute

//     // Cleanup
//     return () => clearInterval(intervalId);
//   }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

//   const handleViewProduct = (id) => {
//     navigate(`/product/${id}`);
//   };

//   const getProductsByStatus = (status) => {
//     // Ensure products is an array before filtering
//     if (!Array.isArray(products)) {
//       return [];
//     }
//     return products.filter((p) => p.auction && p.auction.status === status);
//   };

//   const renderProducts = (filteredProducts) => {
//     if (loading) return <p>Loading...</p>;
//     if (!filteredProducts || filteredProducts.length === 0)
//       return <p>No products found.</p>;

//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {filteredProducts.map((product) => {
//           // Use a more robust key if id might be missing sometimes,
//           // though product.id is preferred if available.
//           // Using product.id || index is another option if ids are not guaranteed.
//           const cardKey = product.id
//             ? `product-${product.id}`
//             : `product-${product.name}-${Math.random()}`;

//           const now = new Date();
//           const startTime = product?.auction?.startTime
//             ? new Date(product.auction.startTime)
//             : null;

//           let label = ""; // Initialize label

//           // *** FIX: Check status before determining the time-based label ***
//           const status = product?.auction?.status;

//           // Only calculate the time-based label if the status is SCHEDULED or LIVE
//           if (status === "SCHEDULED" || status === "LIVE") {
//             if (startTime) {
//               const startDate = startTime.toDateString();
//               const today = now.toDateString();
//               const tomorrow = new Date(now);
//               tomorrow.setDate(now.getDate() + 1);
//               const tomorrowDate = tomorrow.toDateString();

//               // Check if the start date is today or tomorrow
//               if (startDate === today) {
//                 label = now < startTime ? "Starts Today" : "Live Now"; // Changed "Live Today" to "Starts Today" for clarity before start time
//               } else if (startDate === tomorrowDate) {
//                 label = "Starts Tomorrow";
//               }
//             }
//           }
//           // *** End of Label Fix ***

//           return (
//             // --- Card Design Improvements ---
//             <Card
//               key={cardKey} // Use the more robust key
//               className="shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col rounded-lg overflow-hidden" // Added flex-col, overflow-hidden, rounded-lg
//               onClick={() => handleViewProduct(product.id)} // Ensure product.id is used for navigation
//             >
//               {/* Image with fixed height and cover */}
//               {product.imageUrl && ( // Only render if image URL exists
//                 <div className="w-full h-48 overflow-hidden">
//                   {" "}
//                   {/* Fixed height wrapper */}
//                   <img
//                     src={product.imageUrl}
//                     alt={product.name || "Product Image"} // Add alt text fallback
//                     className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105" // object-cover to maintain aspect ratio, slight scale on hover
//                   />
//                 </div>
//               )}

//               {/* Card Content */}
//               <CardContent className="p-4 flex-grow">
//                 {" "}
//                 {/* flex-grow to push footer down if needed */}
//                 {/* Label (only renders if label is not empty) */}
//                 {label && (
//                   <p className="text-sm text-primary font-semibold mb-1">
//                     {label}
//                   </p>
//                 )}
//                 {/* Title */}
//                 <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
//                   {" "}
//                   {/* Added text styles, line-clamp for long titles */}
//                   {product.name}
//                 </CardTitle>
//                 {/* Description */}
//                 {product.description && ( // Only render description if it exists
//                   <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
//                     {" "}
//                     {/* Added line-clamp for description */}
//                     {product.description}
//                   </p>
//                 )}
//                 {/* You could add more details here like price range, bid count, etc. if available */}
//               </CardContent>
//               {/* Optional: Add a small footer to the card itself for bids/price if desired */}
//               {/* <div className="p-4 pt-0 text-right">
//                   <span className="text-md font-bold text-gray-900">$150</span> Current Bid
//               </div> */}
//             </Card>
//           );
//         })}
//       </div>
//     );
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {" "}
//       {/* Added vertical padding */}
//       <AnimatedImage />
//       {/* Upcoming Products Section */}
//       <section className="py-8">
//         {" "}
//         {/* Use py- instead of p- to control vertical spacing */}
//         <h2
//           className="text-dark text-2xl font-bold mb-6 border-b pb-2" // Larger font, bold, bottom border
//           style={{ fontFamily: "var(--font-roboto), sans-serif" }} // Ensure fallback font
//         >
//           Upcoming Products
//         </h2>
//         {renderProducts(getProductsByStatus("SCHEDULED"))}
//       </section>
//       {/* Live Products Section */}
//       <section className="py-8">
//         <h2
//           className="text-dark text-2xl font-bold mb-6 border-b pb-2"
//           style={{ fontFamily: "var(--font-roboto), sans-serif" }}
//         >
//           Live Products
//         </h2>
//         {renderProducts(getProductsByStatus("LIVE"))}
//       </section>
//       {/* Closed Products Section */}
//       <section className="py-8">
//         <h2
//           className="text-dark text-2xl font-bold mb-6 border-b pb-2"
//           style={{ fontFamily: "var(--font-roboto), sans-serif" }}
//         >
//           Closed Products
//         </h2>
//         {renderProducts(getProductsByStatus("CLOSED"))}
//       </section>
//       {/* --- Footer Design Improvements --- */}
//       {/* Using a standard semantic <footer> element */}
//       <footer className="bg-gray-900 text-white mt-12 py-8">
//         {" "}
//         {/* Darker background, added top margin and padding */}
//         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
//           {" "}
//           {/* Responsive grid layout */}
//           {/* Brand/About Section */}
//           <div className="col-span-1">
//             <h2
//               style={{ fontFamily: "var(--font-roboto), sans-serif" }} // Ensure fallback font
//               className="text-3xl font-bold text-primary mb-3" // Larger, bold, primary color for emphasis
//             >
//               NADA
//             </h2>
//             <p className="text-gray-400 text-sm">
//               Millions of unique items are added to NADA each year from 700
//               expert auction houses worldwide. Discover rare finds and unique
//               collectibles.
//             </p>
//           </div>
//           {/* Placeholder for Quick Links (example) */}
//           <div className="col-span-1">
//             <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
//             <ul className="text-gray-400 text-sm space-y-2">
//               <li>
//                 <a href="#" className="hover:text-primary transition-colors">
//                   About Us
//                 </a>
//               </li>
//               <li>
//                 <a href="#" className="hover:text-primary transition-colors">
//                   How it Works
//                 </a>
//               </li>
//               <li>
//                 <a href="#" className="hover:text-primary transition-colors">
//                   Support
//                 </a>
//               </li>
//               <li>
//                 <a href="#" className="hover:text-primary transition-colors">
//                   Terms of Service
//                 </a>
//               </li>
//             </ul>
//           </div>
//           {/* Placeholder for Contact/Social (example) */}
//           <div className="col-span-1">
//             <h3 className="text-lg font-semibold mb-3">Connect</h3>
//             <p className="text-gray-400 text-sm">
//               Email: info@nada.example.com
//             </p>
//             <div className="flex space-x-4 mt-3">
//               {/* Replace with actual social media icons/links if needed */}
//               <a
//                 href="#"
//                 className="text-gray-400 hover:text-primary transition-colors"
//               >
//                 <i className="fab fa-facebook-f"></i>
//               </a>{" "}
//               {/* Example using Font Awesome */}
//               <a
//                 href="#"
//                 className="text-gray-400 hover:text-primary transition-colors"
//               >
//                 <i className="fab fa-twitter"></i>
//               </a>
//               <a
//                 href="#"
//                 className="text-gray-400 hover:text-primary transition-colors"
//               >
//                 <i className="fab fa-instagram"></i>
//               </a>
//             </div>
//           </div>
//         </div>
//         {/* Copyright */}
//         <div className="container mx-auto px-4 mt-8 border-t border-gray-700 pt-6 text-center text-gray-500 text-xs">
//           &copy; {new Date().getFullYear()} NADA. All rights reserved.
//         </div>
//       </footer>
//       {/* --- End of Footer Design Improvements --- */}
//     </div>
//   );
// };

// export default Home;

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import AnimatedImage from "../components/ui/AnimatedImage";
import ProductService from "../services/ProductService";
import { useNavigate } from "react-router-dom"; // Assuming react-router-dom v6+

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await ProductService.getAll();
        if (
          response?.data?.ReturnObject &&
          Array.isArray(response.data.ReturnObject)
        ) {
          // console.log("API Response Data:", response.data.ReturnObject); // Optional: Keep for debugging
          setProducts(response.data.ReturnObject);
        } else {
          console.error("Unexpected response format:", response.data);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    const intervalId = setInterval(fetchProducts, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const handleViewProduct = (id) => {
    navigate(`/product/${id}`);
  };

  const getProductsByStatus = (status) => {
    if (!Array.isArray(products)) {
      return [];
    }
    return products.filter((p) => p.auction && p.auction.status === status);
  };

  // Function to render a *limited* list of products (still takes the sliced array)
  const renderLimitedProducts = (filteredProducts) => {
    if (!filteredProducts || filteredProducts.length === 0)
      return (
        <p className="text-gray-600">No products found in this category yet.</p>
      ); // Adjusted message slightly

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => {
          const cardKey = product.id
            ? `product-${product.id}`
            : `product-${product.name}-${index}`;

          const now = new Date();
          const startTime = product?.auction?.startTime
            ? new Date(product.auction.startTime)
            : null;

          let label = "";
          const status = product?.auction?.status;

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
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // *** Removed the shouldShowViewAll function ***

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedImage />

      {loading && <p className="text-center text-lg">Loading products...</p>}

      {!loading && (
        <>
          {/* Upcoming Products Section */}
          <section className="py-8">
            <h2
              className="text-dark text-2xl font-bold mb-6 border-b pb-2"
              style={{ fontFamily: "var(--font-roboto), sans-serif" }}
            >
              Upcoming Products
            </h2>
            {/* Render only the first 4 upcoming products */}
            {renderLimitedProducts(
              getProductsByStatus("SCHEDULED").slice(0, 4)
            )}
            {/* *** Button now shows unconditionally if not loading *** */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate("/products/scheduled")} // Navigate to the full list page
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                View All Upcoming Products
              </button>
            </div>
          </section>

          {/* Live Products Section */}
          <section className="py-8">
            <h2
              className="text-dark text-2xl font-bold mb-6 border-b pb-2"
              style={{ fontFamily: "var(--font-roboto), sans-serif" }}
            >
              Live Products
            </h2>
            {/* Render only the first 4 live products */}
            {renderLimitedProducts(getProductsByStatus("LIVE").slice(0, 4))}
            {/* *** Button now shows unconditionally if not loading *** */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate("/products/live")} // Navigate to the full list page
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                View All Live Products
              </button>
            </div>
          </section>

          {/* Closed Products Section */}
          <section className="py-8">
            <h2
              className="text-dark text-2xl font-bold mb-6 border-b pb-2"
              style={{ fontFamily: "var(--font-roboto), sans-serif" }}
            >
              Closed Products
            </h2>
            {/* Render only the first 4 closed products */}
            {renderLimitedProducts(getProductsByStatus("CLOSED").slice(0, 4))}
            {/* *** Button now shows unconditionally if not loading *** */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate("/products/closed")} // Navigate to the full list page
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                View All Closed Products
              </button>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12 py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <h2
              style={{ fontFamily: "var(--font-roboto), sans-serif" }}
              className="text-3xl font-bold text-primary mb-3"
            >
              NADA
            </h2>
            <p className="text-gray-400 text-sm">
              Millions of unique items are added to NADA each year from 700
              expert auction houses worldwide. Discover rare finds and unique
              collectibles.
            </p>
          </div>
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-3">Connect</h3>
            <p className="text-gray-400 text-sm">
              Email: info@nada.example.com
            </p>
            <div className="flex space-x-4 mt-3">
              {/* Example using Font Awesome icons */}
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 border-t border-gray-700 pt-6 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} NADA. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
