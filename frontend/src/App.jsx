<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from "react-router-dom";
=======
import { useLocation, Routes, Route } from "react-router-dom";
>>>>>>> Development
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Navbar from "./components/ui/Navbar";
import Home from "./pages/Home";
<<<<<<< HEAD
import CreateProduct from "./pages/products/CreateProduct";
import AuctionForm from "./pages/products/AuctionForm";


function App() {
  return (
    <BrowserRouter>
      <Navbar />
=======
import AuctionForm from "./pages/products/AuctionForm";
import AdminDashboard from "./pages/admin/AdminDashboard";

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
>>>>>>> Development
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
<<<<<<< HEAD
        <Route path="/add" element={<CreateProduct />} />
        <Route path="/auction" element={<AuctionForm />} />
      </Routes>
    </BrowserRouter>
=======
        <Route path="/auction" element={<AuctionForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Layout>
>>>>>>> Development
  );
}

export default App;
