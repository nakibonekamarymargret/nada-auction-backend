import { useLocation, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Navbar from "./components/ui/Navbar";
import Home from "./pages/Home";
import AuctionForm from "./pages/products/AuctionForm";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ViewProduct from "./pages/products/ViewProduct";
import ProtectedAdminRoute from "./pages/Auth/ProtectedAdminRoute";
import ProtectedUserRoute from "./pages/Auth/ProtectedUserRoute";
import Footer from "./pages/Footer";
import BidApprovalForm from "./pages/bid/BidApprovalForm";
import SearchResultsPage from "./pages/SearchResultsPage";
import AboutUsPage from "./pages/products/AboutUsPage";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import PlaceBid from "./pages/bid/PlaceBid.jsx";
 import WatchListPage from "./pages/WatchListPage";


const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarOn = [
    "/admin",
    "/login",
    "/register",
    "/add",
  ];
  const hideFooterOn = ["/login", "/register",  "/approved/:auctionId","/admin"];

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
        <Route path="/aboutUs" element={<AboutUsPage />} />
        <Route path="/terms" element={<TermsAndConditionsPage />} />
        <Route path="/watch" element={<WatchListPage />} />

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
        <Route
          path="/bids/place/:id"
          element={
            <ProtectedUserRoute>
              <PlaceBid />
            </ProtectedUserRoute>
          }
        />
        <Route path="/search-results" element={<SearchResultsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
