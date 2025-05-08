import React, { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/ui/app-sidebar";
import AuctionModal from "../auctions/AuctionModal";
import AddProductModal from "./AddProductModal";
import Bargraph from "../../components/ui/Bargraph";
import Piechart from "../../components/ui/PieChartStatus";
import Pagination from "@/components/ui/pagination";

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

  const [loading, setLoading] = useState(true);
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

        // Count data
        const auctions = auctionRes.data || [];
        const users = userRes.data || [];
        const products = productRes.data || [];
        const bids = bidRes.data || [];

        const activeAuctions = auctions.filter(
          (a) => a.status === "LIVE"
        ).length;

        setCounts({
          totalUsers: users.length,
          activeAuctions,
          productsListed: products.length,
          pendingBids: bids.length,
        });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-100 w-full">
        <AppSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="nav flex items-center justify-between p-4 rounded-lg mb-6">
            <SidebarTrigger />
            <div className="user-icon flex items-center">
              <img
                src="https://via.placeholder.com/40"
                alt="User Avatar"
                className="rounded-full"
              />
              <span className="text-white ml-2">Admin</span>
            </div>
          </div>

          {/* Header */}
          <header className="mb-10">
            <h1
              style={{ fontFamily: "var(--font-roboto)" }}
              className="text-4xl font-bold text-gray-900 mb-2"
            >
              Dashboard
            </h1>
            <p className="text-gray-600">General Report</p>
          </header>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              {
                title: "Total Users",
                value: counts.totalUsers,
                icon: "Users",
                color: "bg-blue-100",
              },
              {
                title: "Active Auctions",
                value: counts.activeAuctions,
                icon: "Gavel",
                color: "bg-purple-100",
              },
              {
                title: "Products Listed",
                value: counts.productsListed,
                icon: "PackageCheck",
                color: "bg-green-100",
              },
              {
                title: "Pending Bids",
                value: counts.pendingBids,
                icon: "Timer",
                color: "bg-yellow-100",
              },
            ].map(({ title, value, icon, color }) => (
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
            <Bargraph />
            <Piechart />
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
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Example static rows — replace with real data if needed */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">iPhone 14</td>
                    <td className="px-4 py-3">Electronics</td>
                    <td className="px-4 py-3">$999</td>
                    <td className="px-4 py-3">Available</td>
                    <td className="px-4 py-3 text-blue-600">Edit | Delete</td>
                  </tr>
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
                  {/* Example static rows — replace with real data if needed */}
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
