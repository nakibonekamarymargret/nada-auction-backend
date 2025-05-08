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
<<<<<<< HEAD
=======
 Development
>>>>>>> b9164b7258b837b66d59c9084b5c8d6537e5285d

const Layout = ({ children }) => {
  const location = useLocation();
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
<<<<<<< HEAD

=======
>>>>>>> b9164b7258b837b66d59c9084b5c8d6537e5285d
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
