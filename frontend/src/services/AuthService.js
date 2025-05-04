// services/AuthService.js
import axios from "axios";

const API_URL = "http://localhost:7107/api";
<<<<<<< HEAD

=======
const config = {
  headers: {
    "Content-Type": "application/json",
  },
};
>>>>>>> Development

class AuthService {
  register = async (userData) => {
    const data = JSON.stringify(userData);
<<<<<<< HEAD
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    return await axios.post(`${API_URL}/auth/register`, data, config);

  }
  login = async (credentials) => {
    const data = JSON.stringify(credentials);
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    return await axios.post(`${API_URL}/auth/login`, data, config);
  }
=======
    
    return await axios.post(`${API_URL}/auth/register`, data, config);

  }

  login = async (credentials) => {
    const data = JSON.stringify(credentials);
   
    return await axios.post(`${API_URL}/auth/login`, data, config);
  }
  
>>>>>>> Development
  logout= () => {
    localStorage.removeItem("user");
  }

  getCurrentUser= () => {
    return JSON.parse(localStorage.getItem("user"));
  }

}
export default new AuthService();