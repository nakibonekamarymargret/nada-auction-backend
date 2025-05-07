import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  console.log("Checking role:", role); // DEBUG

  if (!token || role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
