import { useLocation, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Navbar from "./components/ui/Navbar";
import Home from "./pages/Home";
import AuctionForm from "./pages/products/AuctionForm";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ViewProduct from "./pages/products/ViewProduct";
import ProtectedAdminRoute from "./pages/Auth/ProtectedAdminRoute";
import Footer from "./pages/Footer";
import BidApprovalForm from "./pages/bid/BidApprovalForm";
import SearchResultsPage from "./pages/SearchResultsPage";
import PlaceBid from "./pages/bid/PlaceBid.jsx";


const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarOn = [
    "/admin",
    "/login",
    "/register",
    "/add",
  ];
  const hideFooterOn = ["/login", "/register",  "/approved/:auctionId","/admin"];

  // Use pathname matching for dynamic routes like /watch-auction/:id
  const shouldHideFooter = hideFooterOn.some((route) =>
    route.includes(":")
      ? location.pathname.startsWith(route.split(":")[0])
      : location.pathname === route
  );

  return (
    <>
      {!hideNavbarOn.includes(location.pathname) && <Navbar />}
      {children}
      {!shouldHideFooter && <Footer />}
    </>
  );
};


function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/approved/:auctionId" element={<BidApprovalForm />} />
        {/* Admin-protected routes */}
        <Route
          path="/auction"
          element={
            <ProtectedAdminRoute>
              <AuctionForm />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/product/:id" element={<ViewProduct />} />
        <Route path="/bids/place/:id" element={<PlaceBid />} />
        <Route path="/search-results" element={<SearchResultsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
