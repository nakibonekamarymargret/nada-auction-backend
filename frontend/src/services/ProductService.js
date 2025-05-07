import axios from "axios";

const API_URL = "http://localhost:7107/product";

const ProductService = {
  getAll: async () => {
    return await axios.get(`${API_URL}/all`);
  },


  add: async (productData, file, auctionId, token) => {
    const formData = new FormData(); // Browser's native FormData
    formData.append("product", JSON.stringify(productData)); // Appending JSON string
    formData.append("file", file); // Appending the browser's File object
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return axios.post(`${API_URL}/add/${auctionId}`, formData, config); // Correct Axios POST call
  },

  updateProduct: async (id, productData, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
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
