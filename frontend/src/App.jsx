import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Navbar from "./components/ui/Navbar";
import Home from "./pages/Home";
import CreateProduct from "./pages/products/CreateProduct";
import AuctionForm from "./pages/products/AuctionForm";


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<CreateProduct />} />
        <Route path="/auction" element={<AuctionForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
