import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedImage from "../components/ui/AnimatedImage";
import ProductService from "../services/ProductService";
import { useNavigate } from "react-router-dom";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [expandedSections, setExpandedSections] = useState({
        SCHEDULED: false,
        LIVE: false,
        CLOSED: false,
    });

    // Fetch products every minute
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
        let filtered = products
            .filter((product) => {
                const auctionStatusMatches =
                    product.auction && product.auction.status === status;

                if (status === "LIVE") {
                    return auctionStatusMatches && !product.closed;
                }

                if (status === "CLOSED") {
                    return product.closed;
                }

                return auctionStatusMatches;
            })
            .sort((a, b) => {
                const aStartTime = new Date(a.auction?.startTime || "");
                const bStartTime = new Date(b.auction?.startTime || "");
                return bStartTime - aStartTime;
            });

        if (status === "CLOSED") {
            return filtered.slice(0, 10); // Only return top 10 closed
        }

        return filtered;
    };

    const toggleSection = (status) => {
        setExpandedSections((prev) => ({
            ...prev,
            [status]: !prev[status],
        }));
    };

    const renderProducts = (filteredProducts, status) => {
        if (loading) return <p>Loading...</p>;
        if (!filteredProducts.length) {
            return (
                <p style={{ fontFamily: "var(--font-tenor)" }} className="text-md">
                    No products found.
                </p>
            );
        }

        const isExpanded = expandedSections[status];
        const displayedProducts = isExpanded
            ? filteredProducts
            : filteredProducts.slice(0, 6);
        const showButton = filteredProducts.length > 6;

        // Determine grid columns based on displayedProducts length
        let gridColsClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"; // Default multi-column
        if (displayedProducts.length === 1) {
            gridColsClass = "grid-cols-1"; // Force single column if only one product
        }

        return (
            <div>
                <div className={`grid ${gridColsClass} gap-6`}>
                    {displayedProducts.map((product) => {
                        const now = new Date();
                        const startTime = product?.auction?.startTime
                            ? new Date(product.auction.startTime)
                            : null;
                        let label = "";

                        // Only show label if section is SCHEDULED or LIVE
                        if (status === "SCHEDULED" || status === "LIVE") {
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
                        }

                        return (
                            <Card
                                key={product.id || product.name}
                                className=" shadow-lg cursor-pointer hover:shadow-xl transition duration-300 border rounded-lg overflow-hidden"
                                onClick={() => handleViewProduct(product.id)}
                            >

                                <div className="w-full h-80 relative">
                                    <img
                                        src={product.imageUrl || "/placeholder-image.jpg"}
                                        alt={product.name || "Product Image"}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>

                                <CardContent className="p-4 space-y-2">
                                    <h3
                                        style={{fontFamily: "var(--font-playfair)", color: "var(--chart-2)"}}
                                        className="text-xl font-semibold "
                                    >
                                        {product.name}
                                    </h3>
                                    {label && (
                                        <p
                                            className="text-sm text-gray-600"
                                            style={{fontFamily: "var(--font-roboto)"}}
                                        >
                                            {label}
                                        </p>
                                    )}
                                    <p
                                        className="text-base text-gray-700 line-clamp-2"
                                        style={{fontFamily: "var(--font-roboto)"}}
                                    >
                                        {product.description.split(".")[0]}...
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                {showButton && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => toggleSection(status)}
                            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-300 px-4 py-2 rounded-md transition"
                        >
                            <span className="text-white">{isExpanded ? "Show Less" : "Show More"}</span>
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

            <section className="p-6">
                <h2
                    className="text-dark text-2xl font-bold mb-4"
                    style={{ fontFamily: "var(--font-baskerville)" }}
                >
                    UPCOMING EVENTS
                </h2>
                {renderProducts(getProductsByStatus("SCHEDULED"), "SCHEDULED")}
            </section>

            <section className="p-6">
                <h2
                    className="text-dark text-2xl font-bold mb-4"
                    style={{ fontFamily: "var(--font-baskerville)" }}
                >
                    LIVE EVENTS
                </h2>
                {renderProducts(getProductsByStatus("LIVE"), "LIVE")}
            </section>

            <section className="p-6">
                <h2
                    className="text-red-800 text-xl font-semibold mb-4"
                    style={{ fontFamily: "var(--font-baskerville)" }}
                >
                    CLOSED EVENTS
                </h2>
                {renderProducts(getProductsByStatus("CLOSED"), "CLOSED")}
            </section>
        </div>
    );
};

export default Home;