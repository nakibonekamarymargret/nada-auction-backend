// src/components/products/EditProductModal.jsx

"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RiEdit2Fill } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// *** Import SweetAlert2 ***
import Swal from "sweetalert2";

// Assuming PRODUCT_CATEGORIES is defined elsewhere or is correct
const PRODUCT_CATEGORIES = ["ELECTRONICS", "ART", "FASHION", "HOME", "SPORTS"]; // Make sure these match your backend enum exactly

export function EditProductModal({ product, onProductUpdated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    // highestPrice: "", // Removed from state as it's not updateable via this modal
    category: "",
  });
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null); // *** Error state might not be needed if using Swal ***

  // Load product data when modal opens
  React.useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        // highestPrice: product.price != null ? product.price.toString() : "", // Removed
        category: product.category || "", // Assuming product.category from backend is the enum string
      });
      // setError(null); // Clear error on open
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ensure product and product.id exist before proceeding
    if (!product?.id) {
      // Use Swal for validation error
      Swal.fire("Error", "Product ID is missing.", "error");
      return;
    }

    setLoading(true);
    // setError(null); // Clear previous errors

    // Get the token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire(
        "Authentication Error",
        "Authentication token not found. Please log in.",
        "error"
      );
      setLoading(false);
      return;
    }

    try {
      // Construct the data matching the backend ProductUpdateDto
      const updatedData = {
        name: formData.name,
        description: formData.description,
        // highestPrice: parseFloat(formData.highestPrice), // Removed
        category: formData.category,
        // Add other fields if they exist in your DTO and form:
        // imageUrl: formData.imageUrl, // Example
      };

      const response = await fetch(
        `http://localhost:7107/product/edit/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Success: Use Swal for success notification
        if (onProductUpdated && result.ReturnObject) {
          onProductUpdated(result.ReturnObject);
        }
        setIsOpen(false); // Close modal on success
        Swal.fire("Success!", "Product updated successfully.", "success");
      } else {
        // Backend returned an error status code
        const errorMessage =
          result.ReturnObject ||
          `Error: ${response.status} ${response.statusText}` ||
          "Failed to update product.";
        // Use Swal for error notification
        Swal.fire("Update Failed", errorMessage, "error");
        // Optionally log the full error result
        console.error("Update failed:", result);
        // setError(errorMessage); // If you still want to display error inside modal
      }
    } catch (err) {
      // Network errors or issues before getting a response
      console.error("Fetch error during update:", err);
      const errorMessage = err.message || "An unexpected error occurred.";
      // Use Swal for network error notification
      Swal.fire("Error", errorMessage, "error");
      // setError(errorMessage); // If you still want to display error inside modal
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* This button should be placed in AdminDashboard */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-600 hover:text-blue-600 focus:outline-none"
        aria-label={`Edit Product ${product?.name || ""}`}
        title="Edit Product"
      >
        <RiEdit2Fill size={18} />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              {/* Category */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* You can add the price input back here if you want to DISPLAY it (disabled) */}
              {/*
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="currentPrice" className="text-right">Current Price</Label>
                 <Input
                   id="currentPrice"
                   value={`$${(product?.price || 0).toFixed(2)}`} // Display current price from prop
                   className="col-span-3"
                   disabled // Cannot edit price here
                 />
               </div>
               */}
            </div>
            {/* *** Error display removed as SweetAlert handles notifications *** */}
            {/* {error && (
              <p className="text-sm text-red-500 text-center mt-4">{error}</p>
            )} */}
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
