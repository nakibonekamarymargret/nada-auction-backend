import React, { useState} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    highestPrice: "",
    category: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto mt-6 p-4 border rounded-xl shadow"
    >
      <div className="selec-auction">
        <Button>Select Auction</Button>
        <Select
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
      <Button>Create Auction</Button>
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

      <div>
        <Label htmlFor="description">Description</Label>
        <div className="border rounded-md p-2 min-h-[150px]">
          <EditorContent editor={editor} />
        </div>
      </div>

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

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
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

      {error && <p className="text-red-500">{error}</p>}
      {success && (
        <p className="text-green-500">Product created successfully!</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Create Product"}
      </Button>
    </form>
  );
};

export default AddProduct;
