import { useLocation, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Navbar from "./components/ui/Navbar";
import Home from "./pages/Home";
import AuctionForm from "./pages/products/AuctionForm";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ViewProduct from "./pages/products/ViewProduct";
import ProtectedAdminRoute from "./pages/Auth/ProtectedAdminRoute";
import WatchAuction from "./pages/auctions/WatchAuction";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarOn = ["/admin", "/login", "/register", "/add"];
  const hideNavbarOn = ["/admin", "/login", "/register", "/add"];

  return (
    <>
      {!hideNavbarOn.includes(location.pathname) && <Navbar />}
      {children}
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
        <Route path="/watch-auction/:id" element={<WatchAuction />} />

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
      </Routes>
    </Layout>
  );
}

export default App;
