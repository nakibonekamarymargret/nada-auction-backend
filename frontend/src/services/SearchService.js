import axios from "axios";

const API_URL = "http://localhost:7107/auctions/search/product"; // Backend search URL

class SearchService {
  // Method to search auctions by keyword
  searchAuctions = async (name) => {
    try {
      const response = await axios.get(API_URL, {
        params: { name }, // Send the keyword as query parameter
      });

      return response.data.ReturnObject; // Return the auctions from the response
    } catch (err) {
      console.error("Error while searching auctions:", err);
      throw err; // Re-throw the error to be handled later
    }
  };
}

export default new SearchService();
