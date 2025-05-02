import { useLocation, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Navbar from "./components/ui/Navbar";
import Home from "./pages/Home";
import CreateProduct from "./pages/products/CreateProduct";
import AuctionForm from "./pages/products/AuctionForm";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddProduct from "./pages/admin/AddProduct";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarOn = ["/admin", "/login", "/register","/add"];

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
        <Route path="/auction" element={<AuctionForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/add" element={<AddProduct />} />
      </Routes>
    </Layout>
  );
}

export default App;
