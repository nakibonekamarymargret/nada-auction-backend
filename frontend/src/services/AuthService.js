// services/AuthService.js
import axios from "axios";

const API_URL = "http://localhost:7107/api";
const config = {
  headers: {
    "Content-Type": "application/json",
  },
};

class AuthService {
  register = async (userData) => {
    const data = JSON.stringify(userData);
    
    return await axios.post(`${API_URL}/auth/register`, data, config);

  }

  login = async (credentials) => {
    const data = JSON.stringify(credentials);
   
    return await axios.post(`${API_URL}/auth/login`, data, config);
  }
  
  logout= () => {
    localStorage.removeItem("user");
  }

  getCurrentUser= () => {
    return JSON.parse(localStorage.getItem("user"));
  }

}
export default new AuthService();