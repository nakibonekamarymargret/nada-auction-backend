import axios from "axios";

const API_URL = "http://localhost:7107/product";

const ProductService = {
  // Get all products
  // Create a new product
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
  getAll: async () => {
    return await axios.get(`${API_URL}/all`);
  },
};

export default ProductService;
