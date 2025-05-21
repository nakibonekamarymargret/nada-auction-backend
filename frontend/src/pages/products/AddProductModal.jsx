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
} from "@/components/ui/dialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select.jsx";

const AddProductModal = ({ auctions, onProductCreated }) => {
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
  const [isModalOpen, setIsModalOpen] = useState(false); // New state to control modal visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Function to reset all form states
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      highestPrice: "",
      category: "",
      auctionId: "",
    });
    setFile(null);
    setLoading(false);
    setSuccess(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("highestPrice", formData.highestPrice);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("file", file);

    try {
      const response = await axios.post(
          `http://localhost:7107/product/add/${formData.auctionId}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
      );
      const newProduct = response.data.ReturnObject;

      // Ensure newProduct has all the fields the parent expects,
      // especially 'status' and 'createdAt' if not directly returned by backend
      if (newProduct && onProductCreated) {
        const selectedAuction = auctions.find(a => a.id.toString() === formData.auctionId);
        const productWithAuctionInfo = {
          ...newProduct,
          auction: {
            status: selectedAuction?.status || "SCHEDULED",
            startTime: selectedAuction?.startTime || new Date().toISOString(),
          }
        };
        onProductCreated(productWithAuctionInfo);
      }

      setSuccess(true); // Show success message briefly
      setTimeout(() => {
        setIsModalOpen(false); // Close the modal after a short delay
        resetForm(); // Reset form fields after closing
      }, 1500); // Give user a moment to see success message before closing
    } catch (err) {
      console.error("Error creating product:", err);
      setError(
          err.response?.data?.message || "Failed to create product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}> {/* Control dialog visibility */}
        <DialogTrigger asChild>
          <Button variant="default" onClick={() => setIsModalOpen(true)}>Create Product</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create Product</DialogTitle>
              <DialogDescription>
                Provide details for your product. Fill in the required fields.
              </DialogDescription>
            </DialogHeader>

            {/* Error & Success Messages */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {success && (
                <p className="text-green-500 text-center mb-4">
                  🎉 Product created successfully!
                </p>
            )}

            {/* Auction Selection */}
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
                      <SelectItem disabled>
                        No scheduled auctions available
                      </SelectItem>
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
            <div className="grid grid-cols-4 items-center gap-4 mb-4">
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
          </form>
        </DialogContent>
      </Dialog>
  );
};

export default AddProductModal;