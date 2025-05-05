import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/ui/app-sidebar";
import AuctionModal from "../auctions/AuctionModal";
import {
  Users,
  Gavel,
  PackageCheck,
  Timer,
  PlusCircle,
  UserPlus,
  Settings,
} from "lucide-react";
import AddProductModal from "./AddProductModal";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const AdminDashboard = () => {


  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-100  w-full">
        <AppSidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <SidebarTrigger />

          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-sm">
              Manage users, products, auctions, and bids from one place.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              {
                title: "Total Users",
                value: "128",
                icon: Users,
                color: "bg-blue-100",
              },
              {
                title: "Active Auctions",
                value: "42",
                icon: Gavel,
                color: "bg-purple-100",
              },
              {
                title: "Products Listed",
                value: "312",
                icon: PackageCheck,
                color: "bg-green-100",
              },
              {
                title: "Pending Bids",
                value: "18",
                icon: Timer,
                color: "bg-yellow-100",
              },
            ].map(({ title, value, icon: Icon, color }) => (
              <div
                key={title}
                className={`p-4 rounded-xl shadow bg-white flex items-center gap-4`}
              >
                <div className={`p-3 rounded-full ${color}`}>
                  <Icon className="w-6 h-6 text-gray-800" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{title}</p>
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <AddProductModal
                onProductCreated={(product) =>
                  console.log("New Prodct:", product)
                }
              />
              <div className="flex items-center">
                <AuctionModal
                  onAuctionCreated={(auction) =>
                    console.log("New Auction:", auction)
                  }
                />
              </div>
            </div>
          </div>
          {/* Recent Products  Table */}
          <div className="bg-white rounded-xl shadow p-6 mb-10">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Recent Products
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-200 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-4 py-2">Product Name</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "iPhone 14",
                      category: "Electronics",
                      price: "$999",
                      status: "Available",
                      actions: "Edit | Delete",
                    },
                    {
                      name: "MacBook Pro",
                      category: "Electronics",
                      price: "$1,999",
                      status: "Sold",
                      actions: "View | Delete",
                    },
                  ].map((product, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{product.name}</td>
                      <td className="px-4 py-2">{product.category}</td>
                      <td className="px-4 py-2">{product.price}</td>
                      <td className="px-4 py-2">{product.status}</td>
                      <td className="px-4 py-2">{product.actions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination justify-end">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>

          {/* Recent Bids Table */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Recent Bids
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-200 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-4 py-2">User</th>
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Bid Amount</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      user: "John Doe",
                      product: "iPhone 14",
                      amount: "$1,200",
                      date: "May 2, 2025",
                    },
                    {
                      user: "Jane Smith",
                      product: "MacBook Pro",
                      amount: "$2,400",
                      date: "May 1, 2025",
                    },
                  ].map((bid, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{bid.user}</td>
                      <td className="px-4 py-2">{bid.product}</td>
                      <td className="px-4 py-2">{bid.amount}</td>
                      <td className="px-4 py-2">{bid.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        <p className="text">Hi</p>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
