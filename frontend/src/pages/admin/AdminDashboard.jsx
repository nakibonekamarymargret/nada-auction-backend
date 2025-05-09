import React, { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/ui/app-sidebar";
import AuctionModal from "../auctions/AuctionModal";
import AddProductModal from "./AddProductModal";
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

// *** Import SweetAlert2 ***
import Swal from "sweetalert2";

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

        // Basic check for data existence and array format
        const auctions =
          auctionRes?.data?.ReturnObject &&
          Array.isArray(auctionRes.data.ReturnObject)
            ? auctionRes.data.ReturnObject
            : [];
        const users =
          userRes?.data?.ReturnObject &&
          Array.isArray(userRes.data.ReturnObject)
            ? userRes.data.ReturnObject
            : [];
        const products =
          productRes?.data?.ReturnObject &&
          Array.isArray(productRes.data.ReturnObject)
            ? productRes.data.ReturnObject
            : [];
        const bids =
          bidRes?.data?.ReturnObject && Array.isArray(bidRes.data.ReturnObject)
            ? bidRes.data.ReturnObject
            : [];

        const activeAuctions = auctions.filter(
          (a) => a.status === "LIVE"
        ).length;

        const newStatusCounts = { LIVE: 0, SCHEDULED: 0, CLOSED: 0 };
        auctions.forEach((a) => {
          if (newStatusCounts.hasOwnProperty(a.status)) {
            newStatusCounts[a.status]++;
          }
        });
        setStatusCounts(newStatusCounts);

        // *** Formatting logic for recentProducts ***
        const formattedProducts = products.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.highestPrice,
          // Corrected status logic:
          status: product.auction
            ? product.auction.status || "N/A" // Use N/A if auction.status is undefined/empty
            : "No Auction", // Or "No Auction" if product.auction is null/undefined
          createdAt: product.auction?.startTime
            ? new Date(product.auction.startTime).toISOString()
            : product.createdAt || new Date().toISOString(),
          imageUrl: product.imageUrl,
          description: product.description,
          lastBidTime: product.lastBidTime,
          auctionId: product.auctionId,
        }));

        // Sort by createdAt desc, take top 5
        formattedProducts.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setRecentProducts(formattedProducts.slice(0, 5));

        setCounts({
          totalUsers: users.length,
          activeAuctions,
          productsListed: products.length,
          pendingBids: bids.length,
        });

        // *** Chart Data Logic ***
        const monthCounts = {};
        auctions.forEach((a) => {
          if (a.createdAt) {
            const date = new Date(a.createdAt);
            const month = date.toLocaleString("default", { month: "long" });
            const year = date.getFullYear();
            const monthYear = `${month} ${year}`;
            monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
          }
        });

        const now = new Date();
        const last6CalendarMonths = [];
        for (let i = 0; i < 6; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = d.toLocaleString("default", { month: "long" });
          const year = d.getFullYear();
          const monthYear = `${monthName} ${year}`;
          const count = monthCounts[monthYear] || 0;
          last6CalendarMonths.unshift({ month: monthName, count: count });
        }
        setChartData(last6CalendarMonths);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        Swal.fire("Load Failed", "Failed to load dashboard data.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, [token]);

  // *** SweetAlert2 Confirmation and Notifications for Delete ***
  const handleDeleteProduct = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await ProductService.deleteProduct(id, token);
      const message =
        response?.data?.ReturnObject || "Product deleted successfully.";
      Swal.fire("Deleted!", message, "success");
      setRecentProducts(recentProducts.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
      const errorMessage =
        error?.response?.data?.ReturnObject ||
        error.message ||
        "Failed to delete product.";
      Swal.fire("Error!", errorMessage, "error");
    }
  };

  // *** Handle Update Product ***
  const handleUpdateProduct = (updatedProductEntity) => {
    const formattedUpdatedProduct = {
      id: updatedProductEntity.id,
      name: updatedProductEntity.name,
      category: updatedProductEntity.category,
      price: updatedProductEntity.highestPrice,
      // Corrected status logic here as well:
      status: updatedProductEntity.auction
        ? updatedProductEntity.auction.status || "N/A"
        : "No Auction",
      createdAt: updatedProductEntity.auction?.startTime
        ? new Date(updatedProductEntity.auction.startTime).toISOString()
        : updatedProductEntity.createdAt || new Date().toISOString(),
      imageUrl: updatedProductEntity.imageUrl,
      description: updatedProductEntity.description,
      lastBidTime: updatedProductEntity.lastBidTime,
      auctionId: updatedProductEntity.auctionId,
    };

    setRecentProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === formattedUpdatedProduct.id ? formattedUpdatedProduct : p
      )
    );
  };

  if (loading) {
    return <div className="text-center text-lg mt-8">Loading dashboard...</div>;
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
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Navbar/Header */}
          <div className="flex items-center justify-between p-4 rounded-lg mb-6 shadow w-full bg-white">
            <SidebarTrigger />
            <div className="user-icon flex items-center">
              <img
                src="https://ui-avatars.com/api/?name=Admin&background=random&size=40"
                alt="User Avatar"
                className="rounded-full"
              />
              <span className="text-gray-800 ml-2">Admin</span>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-8">
            <header className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">General Report</p>
            </header>

            {/* Stats Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map(({ title, value, icon, color }) => (
                <div
                  key={title}
                  className="bg-white rounded-lg shadow p-4 flex items-center space-x-4"
                >
                  <div
                    className={`p-3 rounded-full ${color}`}
                    aria-hidden="true"
                  >
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
              <div className="bg-white rounded-lg shadow p-4">
                <Bargraph chartData={chartData} />
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <PieChartStatus statusCounts={statusCounts} />
              </div>
            </div>

            {/* Quick Actions */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AddProductModal
                  onProductCreated={(newProduct) => {
                    console.log("New Product Created:", newProduct);
                    Swal.fire(
                      "Created!",
                      "Product added successfully.",
                      "success"
                    );
                  }}
                />
                <AuctionModal
                  onAuctionCreated={(newAuction) => {
                    console.log("New Auction Created:", newAuction);
                    Swal.fire(
                      "Created!",
                      "Auction created successfully.",
                      "success"
                    );
                  }}
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
                      <th scope="col" className="px-4 py-3">
                        Product Name
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Category
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Current Price
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Actions
                      </th>
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
                            $
                            {(product.price != null
                              ? product.price
                              : 0
                            ).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                product.status === "LIVE"
                                  ? "bg-green-100 text-green-800"
                                  : product.status === "SCHEDULED"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : product.status === "CLOSED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {product.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 flex items-center space-x-2">
                            <EditProductModal
                              product={product}
                              onProductUpdated={handleUpdateProduct}
                            />
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-800 focus:outline-none"
                              aria-label={`Delete Product ${
                                product?.name || ""
                              }`}
                              title="Delete Product"
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
                          No recent products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Recent Bids Table - (Placeholder based on your original code) */}
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Recent Bids
              </h2>
              <div className="overflow-x-auto">
                {/* You would fetch and map recent bids here, similar to products */}
                <table className="min-w-full text-sm text-left text-gray-800">
                  <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        User
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Product
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Bid Amount
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Example static row - replace with dynamic data */}
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
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;

