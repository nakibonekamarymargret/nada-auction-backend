import axios from "axios";
const API_URL = "http://localhost:7107/api/users";

class UserService {
  getAll = async (token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(API_URL, config);
    return response;
  };
}

export default new UserService();
