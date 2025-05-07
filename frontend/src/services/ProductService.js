import axios from "axios";

const API_URL = "http://localhost:7107/product";

const ProductService = {
  // Get all products
  getAll: async () => {
    return await axios.get(`${API_URL}/all`);
  },

  // Get auction details by ID
  getAuctionById: async (auctionId) => {
    return await axios.get(`http://localhost:7107/auctions/${auctionId}`);
  },

  // Add a new product
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
  updateProduct: async (id, productData, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return axios.put(`${API_URL}/${id}`, productData, config);
  },
  deleteProduct: async (id, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return axios.delete(`${API_URL}/${id}`, config);
  },
};

export default ProductService;
