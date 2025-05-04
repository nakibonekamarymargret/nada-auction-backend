import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AuctionModal from "../auctions/AuctionModal";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import ProductService from "../../services/ProductService";

// Tiptap imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import axios from "axios";

const AddProductModal = () => {
  const [formData, setFormData] = useState({
      name: "",
      description: "",
      highestPrice: "",
      category: "",
      auctionId: "", // Auction id for the selected auction
    });

  const [file, setFile] = useState(null);
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState(false);
   const [error, setError] = useState("");
   const [auctions, setAuctions] = useState([]); // State to store the fetched auctions
   const [isAuctionModalOpen, setAuctionModalOpen] = useState(false); // Modal state
 

  const token = localStorage.getItem("token");
  
    // Tiptap editor instance
    const editor = useEditor({
      extensions: [StarterKit],
      content: "",
      onUpdate: ({ editor }) => {
        setFormData((prev) => ({
          ...prev,
          description: editor.getHTML(),
        }));
      },
    });
  useEffect(() => {
    // Fetch auctions from the API when component mounts
    const fetchAuctions = async () => {
      try {
        const response = await axios.get("http://localhost:7107/auctions/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAuctions(response.data.data); // Adjust based on API response structure
      } catch (err) {
        console.error("Error fetching auctions:", err);
        setError("Failed to fetch auctions");
      }
    };

    fetchAuctions();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      await ProductService.add(formData, file, token);
      setSuccess(true);
      setFormData({
        name: "",
        description: "",
        highestPrice: "",
        category: "",
        auctionId: "", // Reset auction selection
      });
      setFile(null);
      editor.commands.clearContent();
    } catch (err) {
      setError("Failed to create product.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Create Product</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>
            Provide details for your product. Fill in th required fields.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-w-md mx-auto mt-6 p-4 border rounded-xl shadow"
        >
          <div className="flex flex-nowrap gap-2">
            {/* Select Auction Button */}
            <div className="select-auction">
              <Button
                type="button"
                onClick={() => setAuctionModalOpen(true)} // Open modal to select auction
              >
                Select Auction
              </Button>
              <div className="hidden">
                <Select
                  value={formData.auctionId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, auctionId: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an auction" />
                  </SelectTrigger>
                  <SelectContent>
                    {auctions.map((auction) => (
                      <SelectItem key={auction.id} value={auction.id}>
                        {auction.startingPrice} - {auction.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Auction Modal to Create Auction */}
            <AuctionModal
              isOpen={isAuctionModalOpen}
              onClose={() => setAuctionModalOpen(false)}
              onAuctionCreated={(auction) => {
                console.log("New Auction:", auction);
                setFormData((prev) => ({
                  ...prev,
                  auctionId: auction.id,
                }));
                setAuctionModalOpen(false); // Close the modal after selecting auction
              }}
            />
          </div>

          {/* Product Name */}
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description with Tiptap */}
          <div>
            <Label htmlFor="description">Description</Label>
            <div className="border rounded-md p-2 min-h-[150px]">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Highest Price */}
          <div>
            <Label htmlFor="highestPrice">Highest Price</Label>
            <Input
              id="highestPrice"
              name="highestPrice"
              type="number"
              value={formData.highestPrice}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ART">ART</SelectItem>
                <SelectItem value="ELECTRONICS">ELECTRONICS</SelectItem>
                <SelectItem value="ANTIQUES">ANTIQUES</SelectItem>
                <SelectItem value="JEWELRY">JEWELRY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="file">Upload Image</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          {/* Error and Success Messages */}
          {error && <p className="text-red-500">{error}</p>}
          {success && (
            <p className="text-green-500">Product created successfully!</p>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Create Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
