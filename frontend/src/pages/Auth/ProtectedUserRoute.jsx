import { Navigate } from "react-router-dom";

const ProtectedUserRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  console.log("Checking role:", role); // DEBUG

  if (!token || role !== "USER") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedUserRoute;
