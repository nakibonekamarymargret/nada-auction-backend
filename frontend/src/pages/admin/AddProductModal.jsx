import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import AuctionModal from "../auctions/AuctionModal";
import AuctionService from "../../services/AuctionService";
import ProductService from "../../services/ProductService";

const AddProductModal = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    highestPrice: "",
    category: "",
    auctionId: "",

  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [auctions, setAuctions] = useState([]);
  const [isAuctionModalOpen, setAuctionModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch active auctions on mount
  React.useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await AuctionService.getAll(token);

        const fetchedAuctions = Array.isArray(response.data.ReturnObject)
          ? response.data.ReturnObject
          : [];

        const activeAuctions = fetchedAuctions.filter(
          (auction) => auction.status !== "CLOSED"
        );

        setAuctions(activeAuctions);
      } catch (err) {
        console.error("Error fetching auctions:", err);
        setError("Failed to load available auctions.");
      }
    };

    fetchAuctions();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");
    setSuccess(false);

    // Basic validations
    if (!formData.auctionId) {
      setError("Please select an auction.");
      setLoading(false);
      return;
    }

    if (!formData.name.trim()) {
      setError("Product name is required.");
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError("Product description is required.");
      setLoading(false);
      return;
    }

    if (
      !formData.highestPrice ||
      isNaN(formData.highestPrice) ||
      Number(formData.highestPrice) < 0
    ) {
      setError("Highest price must be a non-negative number.");
      setLoading(false);
      return;
    }

    if (!formData.category) {
      setError("Product category is required.");
      setLoading(false);
      return;
    }

    if (!file) {
      setError("An image file is required.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("highestPrice", formData.highestPrice);
      data.append("category", formData.category);
      data.append("file", file);

      const response = await axios.post(
        `http://localhost:7107/product/add/${formData.auctionId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Product creation response:", response.data);

      // Show success message after product is created
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          name: "",
          description: "",
          highestPrice: "",
          category: "",
          auctionId: "",
        });
        setFile(null);
      }, 2000);

    } catch (err) {
      console.error("Product creation failed", err);
      setError(
        err.response?.data?.message ||
          "Failed to create product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Create Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
            <DialogDescription>
              Provide details for your product. Fill in the required fields.
            </DialogDescription>
          </DialogHeader>


          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && (
            <p className="text-green-500 text-center">
              Product created successfully!
            </p>
          )}

          {/* Select Auction */}
          <div className="grid grid-cols-4 items-center gap-4 mb-4">
            <Label htmlFor="auctionId" className="text-right">
              Auction
            </Label>
            <Select
              value={formData.auctionId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, auctionId: value }))
              }
              required
              className="col-span-3"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an auction" />
              </SelectTrigger>
              <SelectContent>
                {auctions.length > 0 ? (
                  auctions.map((auction) => (
                    <SelectItem key={auction.id} value={auction.id.toString()}>
                      {auction.title || `Auction ID: ${auction.id}`} (
                      {auction.status})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled>No auctions available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Product Name */}
          <div className="grid grid-cols-4 items-center gap-4 mb-4">

            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-center gap-4 mb-4">

            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="col-span-3 border rounded-md p-2 min-h-[100px]"
              required
            />
          </div>

          {/* Highest Price */}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="highestPrice" className="text-right">
              Highest Price
            </Label>
            <Input
              id="highestPrice"
              name="highestPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.highestPrice}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>

          {/* Category Dropdown */}
          <div className="grid grid-cols-4 items-center gap-4 mb-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              required
              className="col-span-3"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ART">Art</SelectItem>
                <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                <SelectItem value="ANTIQUES">Antiques</SelectItem>
                <SelectItem value="JEWELRY">Jewelry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload */}
          <div className="grid grid-cols-4 items-center gap-4 mb-4">
          {/* File Upload */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              Image
            </Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="col-span-3"
              required
            />
          </div>


          {/* Submit Button */}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>

          {/* Hidden Trigger for Auction Modal */}

          <div className="hidden">
            <AuctionModal
              isOpen={isAuctionModalOpen}
              onClose={() => setAuctionModalOpen(false)}
              onAuctionCreated={(auction) => {
                setFormData((prev) => ({
                  ...prev,
                  auctionId: auction.id,
                }));
                setAuctionModalOpen(false);
              }}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
