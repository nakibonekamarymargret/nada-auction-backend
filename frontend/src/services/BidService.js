import axios from "axios";

const API_URL = "http://localhost:7107/bids";

class BidService {
  getAll = async (token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(`${API_URL}/all`, config);
    return response;
  };
}
export default new BidService();