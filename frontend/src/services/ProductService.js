import axios from "axios";

const API_URL = "http://localhost:7107/product";

class ProductService {
  // get all products
  getAll = async () => {
    return await axios.get(`${API_URL}/all`);
  };

  // create product
  add = async (product, file, auctionId, token) => {
    const formData = new FormData();

    // Append product JSON as a string
    formData.append("product", JSON.stringify(product));

    // Append image file
    formData.append("file", file);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, // optional if needed
      },
    };

    return await axios.post(`${API_URL}/add/${auctionId}`, formData, config);
  };
}

export default new ProductService();
