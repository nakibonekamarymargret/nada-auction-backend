import axios from "axios";

const API_URL = "http://localhost:7107/product";

const ProductService = {
  // Get all products
<<<<<<< HEAD
  // Create a new product
=======
  getAll: async () => {
    return await axios.get(`${API_URL}/all`);
  },

  // Get auction details by ID
  getAuctionById: async (auctionId) => {
    return await axios.get(`http://localhost:7107/auctions/${auctionId}`);
  },

  // Add a new product
>>>>>>> Development
  add: async (productData, file, auctionId, token) => {
    const formData = new FormData();
    formData.append("product", JSON.stringify(productData));
    formData.append("file", file);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return axios.post(`${API_URL}/add/${auctionId}`, formData, config);
  },
<<<<<<< HEAD
  getAll: async () => {
    return await axios.get(`${API_URL}/all`);
  },
=======
>>>>>>> Development
};

export default ProductService;
