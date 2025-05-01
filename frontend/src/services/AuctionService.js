// services/AuthService.js
import axios from "axios";

const API_URL = "http://localhost:7107/auctions";


class AuctionService {
  //get all auctions
  getAll = async (token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return await axios.get(`${API_URL}/all`, config);
  };

  //create action
  add = async (auction, token) => {
    const data = JSON.stringify(auction);
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    return await axios.post(`${API_URL}/add`, data, config);
  };

  // get auction by id
}
export default new AuctionService();