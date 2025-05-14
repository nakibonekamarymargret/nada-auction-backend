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
    return response
  };
  editUser = async (updatedData, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // Ensure JSON format
      },
    };

    // PATCH request to update user data
    const response = await axios.patch(
      `${API_URL}/edit/user`,
      updatedData,
      config
    );
    return response.data.ReturnObject; // Return the response after update
  };
}

export default new UserService();
