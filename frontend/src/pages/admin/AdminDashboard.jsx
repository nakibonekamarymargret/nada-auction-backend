import React, { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/ui/app-sidebar";
import AuctionModal from "../auctions/AuctionModal";
import AddProductModal from "./AddProductModal";
import {EditProductModal} from "../products/EditProductModal";
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
  const [statusCounts, setStatusCounts] = useState({
    LIVE: 0,
    SCHEDULED: 0,
    CLOSED: 0,
  });

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auctionRes, userRes, productRes, bidRes] = await Promise.all([
          AuctionService.getAll(token),
          UserService.getAll(token),
          ProductService.getAll(token),
          BidService.getAll(token),
        ]);

        const auctions = auctionRes.data.ReturnObject || [];
        const users = userRes.data.ReturnObject || [];
        const products = productRes.data.ReturnObject || [];
        const bids = bidRes.data.ReturnObject || [];

        const activeAuctions = auctions.filter(
          (a) => a.status === "LIVE"
        ).length;

        const newStatusCounts = { LIVE: 0, SCHEDULED: 0, CLOSED: 0 };
        auctions.forEach((a) => {
          if (newStatusCounts[a.status] !== undefined) {
            newStatusCounts[a.status]++;
          }
        });
        setStatusCounts(newStatusCounts);

        const formattedProducts = products.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.highestPrice,
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
          productsListed: products.length,
          pendingBids: bids.length,
        });

        const monthCounts = {};
        auctions.forEach((a) => {
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
  }, [token]);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const response = await ProductService.deleteProduct(id, token);
      const message =
        response?.data?.ReturnObject || "Product deleted successfully.";
      alert(message);
      setRecentProducts(recentProducts.filter((p) => p.id !== id));
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
      title: "Pending Bids",
      value: counts.pendingBids,
      icon: <Timer />,
      color: "bg-yellow-100",
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen  w-full">
        <AppSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
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

          <header className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">General Report</p>
          </header>

          {/* Stats Cards */}
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

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Bargraph chartData={chartData} />
            <PieChartStatus statusCounts={statusCounts} />
          </div>

          {/* Quick Actions */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AddProductModal
                onProductCreated={(product) =>
                  console.log("New Product:", product)
                }
              />
              <AuctionModal
                onAuctionCreated={(auction) =>
                  console.log("New Auction:", auction)
                }
              />
            </div>
          </section>

          {/* Recent Products Table */}
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
                          ${product.price.toFixed(2)}
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

          {/* Recent Bids Table */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Recent Bids
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-800">
                <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Bid Amount</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">John Doe</td>
                    <td className="px-4 py-3">iPhone 14</td>
                    <td className="px-4 py-3">$1,200</td>
                    <td className="px-4 py-3">May 2, 2025</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
