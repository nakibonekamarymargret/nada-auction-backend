import React, { useEffect, useState, useCallback } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/ui/app-sidebar";
import AuctionModal from "../auctions/AuctionModal";
import AddProductModal from "../products/AddProductModal.jsx";
import { EditProductModal } from "../products/EditProductModal";
import { Bargraph } from "../../components/ui/Bargraph";
import { Users, Gavel, PackageCheck, Timer } from "lucide-react";
import { PieChartStatus } from "../../components/ui/PieChartStatus";
import { RiEdit2Fill, RiDeleteBin6Line } from "react-icons/ri";

// Services
import AuctionService from "../../services/AuctionService";
import UserService from "../../services/UserService";
import ProductService from "../../services/ProductService";
import BidService from "../../services/BidService";

const AdminDashboard = () => {
  const [counts, setCounts] = useState({
    totalUsers: 0,
    activeAuctions: 0,
    productsListed: 0,
    pendingBids: 0,
  });

  const [recentProducts, setRecentProducts] = useState([]);
  const [wonBids, setWonBids] = useState([]); // State for won bids
  const [statusCounts, setStatusCounts] = useState({
    LIVE: 0,
    SCHEDULED: 0,
    CLOSED: 0,
  });

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const token = localStorage.getItem("token");

  const fetchAuctions = useCallback(async () => {
    try {
      const response = await AuctionService.getAll(token);
      const fetchedAuctions = Array.isArray(response.data.ReturnObject)
          ? response.data.ReturnObject
          : [];
      setAuctions(
          fetchedAuctions.filter((auction) => auction.status === "SCHEDULED")
      );
    } catch (err) {
      console.error("Error fetching auctions:", err);
    }
  }, [token]);

  // Combined fetch function to get all necessary data at once
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchAuctions(); // Ensure auctions are fetched for product creation

        const [auctionRes, userRes, productRes, bidRes] = await Promise.all([
          AuctionService.getAll(token), // All auctions for dashboard stats
          UserService.getAll(token),
          ProductService.getAll(token), // All products (needed for winning bid logic)
          BidService.getAll(token), // All bids (needed for winning bid logic)
        ]);

        const allAuctions = auctionRes.data.ReturnObject || [];
        const users = userRes.data.ReturnObject || [];
        const allProducts = productRes.data.ReturnObject || []; // Renamed to allProducts for clarity
        const allBids = bidRes.data.ReturnObject || []; // Renamed to allBids for clarity

        // --- Calculate Won Bids ---
        const calculatedWonBids = [];
        allProducts.forEach(product => {
          // Check if the product's auction is closed and has a highest bid
          // Ensure product.highestPrice is the actual highest price recorded after auction close
          if (product.auction && product.auction.status === "CLOSED" && product.highestPrice > 0) {
            // Find the bid that matches this highest price and is for this product
            // We assume bid.amount is a number and product.highestPrice is also a number for comparison
            const winningBid = allBids.find(bid =>
                bid.amount === product.highestPrice &&
                bid.productName === product.name && // Assuming productName comes from backend DTO now
                bid.auctionId === product.auction.id // Assuming auctionId is present on bid DTO for robust check
            );

            if (winningBid) {
              calculatedWonBids.push({
                id: winningBid.id,
                bidderName: winningBid.bidderName,
                productName: winningBid.productName,
                bidAmount: winningBid.amount,
                // Use bidTime if available, otherwise auction end time for date won
                date: winningBid.bidTime || product.auction.endTime || new Date().toISOString(),
              });
            }
          }
        });
        // Sort by date, most recent first
        calculatedWonBids.sort((a, b) => new Date(b.date) - new Date(a.date));
        setWonBids(calculatedWonBids.slice(0, 5));
        // --- End Won Bids Calculation ---


        const activeAuctions = allAuctions.filter(
            (a) => a.status === "LIVE"
        ).length;

        const newStatusCounts = { LIVE: 0, SCHEDULED: 0, CLOSED: 0 };
        allAuctions.forEach((a) => {
          if (newStatusCounts[a.status] !== undefined) {
            newStatusCounts[a.status]++;
          }
        });
        setStatusCounts(newStatusCounts);

        const formattedProducts = allProducts.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          highestPrice: product.highestPrice,
          category: product.category,
          auctionId: product.auctionId,
          status: product.auction?.status || "N/A",
          createdAt: product.auction?.startTime || new Date().toISOString(),
        }));

        formattedProducts.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        });

        setRecentProducts(formattedProducts.slice(0, 5));

        setCounts({
          totalUsers: users.length,
          activeAuctions,
          productsListed: allProducts.length, // Initial count from API
          pendingBids: allBids.length, // This is the total number of bids fetched, rename stat for clarity
        });

        const monthCounts = {};
        allAuctions.forEach((a) => {
          const date = new Date(a.createdAt);
          const month = date.toLocaleString("default", { month: "long" });
          monthCounts[month] = (monthCounts[month] || 0) + 1;
        });

        const monthsOrdered = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

        const fullChartData = monthsOrdered.map((month) => ({
          month,
          count: monthCounts[month] || 0,
        }));

        const now = new Date();
        const currentMonth = now.getMonth();
        const last6Months = [];

        for (let i = 5; i >= 0; i--) {
          const index = (currentMonth - i + 12) % 12;
          last6Months.push(fullChartData[index]);
        }

        setChartData(last6Months);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, fetchAuctions]); // Dependencies for useEffect

  const handleProductCreated = (newProduct) => {
    console.log("New Product created received:", newProduct);

    // Format new product to match recentProducts structure
    const formattedNewProduct = {
      id: newProduct.id,
      name: newProduct.name,
      description: newProduct.description,
      highestPrice: newProduct.highestPrice,
      category: newProduct.category,
      auctionId: newProduct.auctionId,
      status: newProduct.auction?.status || "SCHEDULED", // Ensure status is set
      createdAt: newProduct.auction?.startTime || new Date().toISOString(),
    };

    // Update recentProducts table immediately
    setRecentProducts((prevProducts) =>
        [formattedNewProduct, ...prevProducts].slice(0, 5)
    );

    // Update productsListed count immediately
    setCounts((prevCounts) => ({
      ...prevCounts,
      productsListed: prevCounts.productsListed + 1,
    }));
  };

  const handleAuctionCreated = async (newAuction) => {
    console.log("New Auction created:", newAuction);
    // Re-fetch all data to update dashboard stats and product lists
    // This is a comprehensive re-fetch, ensuring everything is in sync
    setLoading(true);
    try {
      const [auctionRes, productRes, bidRes] = await Promise.all([
        AuctionService.getAll(token),
        ProductService.getAll(token),
        BidService.getAll(token),
      ]);

      const allAuctions = auctionRes.data.ReturnObject || [];
      const allProducts = productRes.data.ReturnObject || [];
      const allBids = bidRes.data.ReturnObject || [];

      // Re-calculate counts and lists
      const activeAuctions = allAuctions.filter(a => a.status === "LIVE").length;
      const newStatusCounts = { LIVE: 0, SCHEDULED: 0, CLOSED: 0 };
      allAuctions.forEach(a => { if (newStatusCounts[a.status] !== undefined) newStatusCounts[a.status]++; });
      setStatusCounts(newStatusCounts);

      setCounts(prev => ({
        ...prev,
        activeAuctions,
        productsListed: allProducts.length,
        pendingBids: allBids.length, // Re-evaluate pending bids if necessary
      }));

      const formattedProducts = allProducts.map(product => ({
        id: product.id, name: product.name, description: product.description,
        highestPrice: product.highestPrice, category: product.category,
        auctionId: product.auctionId, status: product.auction?.status || "N/A",
        createdAt: product.auction?.startTime || new Date().toISOString(),
      }));
      formattedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentProducts(formattedProducts.slice(0, 5));

      // Re-calculate won bids (crucial if new auction closes with a winner)
      const calculatedWonBids = [];
      allProducts.forEach(product => {
        if (product.auction && product.auction.status === "CLOSED" && product.highestPrice > 0) {
          const winningBid = allBids.find(bid =>
              bid.amount === product.highestPrice &&
              bid.productName === product.name &&
              bid.auctionId === product.auction.id
          );
          if (winningBid) {
            calculatedWonBids.push({
              id: winningBid.id, bidderName: winningBid.bidderName,
              productName: winningBid.productName, bidAmount: winningBid.amount,
              date: winningBid.bidTime || product.auction.endTime || new Date().toISOString(),
            });
          }
        }
      });
      calculatedWonBids.sort((a, b) => new Date(b.date) - new Date(a.date));
      setWonBids(calculatedWonBids.slice(0, 5));

      // Re-fetch only scheduled auctions for the AddProductModal
      await fetchAuctions();

    } catch (error) {
      console.error("Error refreshing data after auction creation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const response = await ProductService.deleteProduct(id, token);
      const message =
          response?.data?.ReturnObject || "Product deleted successfully.";
      alert(message);
      setRecentProducts(recentProducts.filter((p) => p.id !== id));
      setCounts((prevCounts) => ({
        ...prevCounts,
        productsListed: prevCounts.productsListed - 1,
      }));
      // If deleting a product could affect won bids, re-fetch relevant data
      // For simplicity, we'll re-run a partial fetch to update counts
      setLoading(true);
      try {
        const [productRes, bidRes] = await Promise.all([
          ProductService.getAll(token),
          BidService.getAll(token),
        ]);
        const allProducts = productRes.data.ReturnObject || [];
        const allBids = bidRes.data.ReturnObject || [];

        // Re-calculate won bids after deletion
        const calculatedWonBids = [];
        allProducts.forEach(product => {
          if (product.auction && product.auction.status === "CLOSED" && product.highestPrice > 0) {
            const winningBid = allBids.find(bid =>
                bid.amount === product.highestPrice &&
                bid.productName === product.name &&
                bid.auctionId === product.auction.id
            );
            if (winningBid) {
              calculatedWonBids.push({
                id: winningBid.id, bidderName: winningBid.bidderName,
                productName: winningBid.productName, bidAmount: winningBid.amount,
                date: winningBid.bidTime || product.auction.endTime || new Date().toISOString(),
              });
            }
          }
        });
        calculatedWonBids.sort((a, b) => new Date(b.date) - new Date(a.date));
        setWonBids(calculatedWonBids.slice(0, 5));

      } catch (err) {
        console.error("Error refreshing data after product deletion:", err);
      } finally {
        setLoading(false);
      }

    } catch (error) {
      const errorMessage =
          error?.response?.data?.ReturnObject ||
          error.message ||
          "Failed to delete product.";
      alert(errorMessage);
    }
  };

  const handleUpdateProduct = (updatedProduct) => {
    setRecentProducts(
        recentProducts.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
        )
    );
    // If updating a product could affect a won bid (e.g., highestPrice changes for a closed auction)
    // you might need to trigger a won bids re-calculation.
    // For simplicity, a full dashboard re-fetch on product update might be overkill,
    // but consider if the updatedProduct's auction status is 'CLOSED'
    // and if its highestPrice has changed relevant to a winning bid.
    // Re-calculating won bids
    setLoading(true);
    try {
      // Fetch fresh product and bid data to ensure accuracy
      Promise.all([
        ProductService.getAll(token),
        BidService.getAll(token)
      ]).then(([productRes, bidRes]) => {
        const allProducts = productRes.data.ReturnObject || [];
        const allBids = bidRes.data.ReturnObject || [];

        const calculatedWonBids = [];
        allProducts.forEach(product => {
          if (product.auction && product.auction.status === "CLOSED" && product.highestPrice > 0) {
            const winningBid = allBids.find(bid =>
                bid.amount === product.highestPrice &&
                bid.productName === product.name &&
                bid.auctionId === product.auction.id
            );
            if (winningBid) {
              calculatedWonBids.push({
                id: winningBid.id, bidderName: winningBid.bidderName,
                productName: winningBid.productName, bidAmount: winningBid.amount,
                date: winningBid.bidTime || product.auction.endTime || new Date().toISOString(),
              });
            }
          }
        });
        calculatedWonBids.sort((a, b) => new Date(b.date) - new Date(a.date));
        setWonBids(calculatedWonBids.slice(0, 5));
      });
    } catch (error) {
      console.error("Error re-calculating won bids after product update:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  const stats = [
    {
      title: "Total Users",
      value: counts.totalUsers,
      icon: <Users />,
      color: "bg-blue-100",
    },
    {
      title: "Active Auctions",
      value: counts.activeAuctions,
      icon: <Gavel />,
      color: "bg-purple-100",
    },
    {
      title: "Products Listed",
      value: counts.productsListed,
      icon: <PackageCheck />,
      color: "bg-green-100",
    },
    {
      title: "All Bids Recorded", // Renamed for clarity since it's now all bids from /bids/all
      value: counts.pendingBids, // This still represents the total number of bids
      icon: <Timer />,
      color: "bg-yellow-100",
    },
  ];

  return (
      <SidebarProvider>
      <div className="flex min-h-screen w-full ">
        
          <AppSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="nav flex items-center justify-between p-4 rounded-lg mb-6 shadow w-full">
              <SidebarTrigger />
              <div className="user-icon flex items-center">
                <img
                    src="https://ui-avatars.com/api/?name=Admin&background=random&size=40"
                    alt="User Avatar"
                    className="rounded-full"
                />
                <span className="text-white ml-2">Admin</span>
              </div>
            </div>
            <div className="p-8">
              <header className="mb-10">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Dashboard
                </h1>
                <p className="text-gray-600">General Report</p>
              </header>

              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map(({ title, value, icon, color }) => (
                    <div
                        key={title}
                        className="bg-white rounded-lg shadow p-4 flex items-center space-x-4"
                    >
                      <div className={`p-3 rounded-full ${color}`} aria-hidden="true">
                        <span className="text-gray-800">{icon}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{title}</p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                      </div>
                    </div>
                ))}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <Bargraph chartData={chartData} />
                <PieChartStatus statusCounts={statusCounts} />
              </div>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AddProductModal
                      auctions={auctions}
                      onProductCreated={handleProductCreated}
                  />
                  <AuctionModal onAuctionCreated={handleAuctionCreated} />
                </div>
              </section>

              <section className="bg-white rounded-lg shadow p-6 mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Recent Products
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-gray-800">
                    <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Current Price</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {recentProducts.length > 0 ? (
                        recentProducts.map((product) => (
                            <tr
                                key={product.id}
                                className="border-b hover:bg-gray-50"
                            >
                              <td className="px-4 py-3">{product.name}</td>
                              <td className="px-4 py-3">{product.category}</td>
                              <td className="px-4 py-3">
                                ${product.highestPrice.toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                            <span
                                className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                    product.status === "LIVE"
                                        ? "bg-green-100 text-green-800"
                                        : product.status === "SCHEDULED"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                }`}
                            >
                              {product.status}
                            </span>
                              </td>
                              <td className="px-4 py-3 text-blue-600 flex items-center space-x-2">
                                <EditProductModal
                                    product={product}
                                    onProductUpdated={handleUpdateProduct}
                                />
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="text-red-600 hover:text-red-800 focus:outline-none"
                                >
                                  <RiDeleteBin6Line size={18} />
                                </button>
                              </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                          <td
                              colSpan="5"
                              className="px-4 py-6 text-center text-gray-500"
                          >
                            No products found
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Won Bids Table */}
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Won Bids
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-gray-800">
                    <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Won Amount</th>
                      <th className="px-4 py-3">Date Won</th>
                    </tr>
                    </thead>
                    <tbody>
                    {wonBids.length > 0 ? (
                        wonBids.map((bid) => (
                            <tr key={bid.id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3">{bid.bidderName}</td>
                              <td className="px-4 py-3">{bid.productName}</td>
                              <td className="px-4 py-3">${bid.bidAmount.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                {new Date(bid.date).toLocaleDateString()}
                              </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                          <td
                              colSpan="4"
                              className="px-4 py-6 text-center text-gray-500"
                          >
                            No won bids found
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </main>
        </div>
      </SidebarProvider>
  );
};

export default AdminDashboard;