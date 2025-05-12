import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PlaceBid = () => {
    const { id: productId } = useParams(); // Get the product ID from the route
    const [amount, setAmount] = useState('');
    const [token] = useState(localStorage.getItem('token')); // Get the JWT token from localStorage
    const [product, setProduct] = useState(null);

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:7107/product/${productId}`);
                const productData = res.data.ReturnObject;
                setProduct(productData);
            } catch (err) {
                console.error("Failed to fetch product data:", err);
                alert("Failed to fetch product details.  Check the console for details.");
            }
        };

        fetchProduct();
    }, [productId]);

    const handleSubmitBid = async (e) => {
        e.preventDefault();

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            alert('Please enter a valid bid amount greater than zero.');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:7107/bids/place/${productId}`, // Use the product ID from the URL
                { amount: Number(amount) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
                        'Content-Type': 'application/json', // Specify content type as JSON
                    },
                }
            );

            console.log('Bid placed successfully:', response.data);
            alert(response.data.ReturnObject.message); // Show a success message
            setAmount(''); // Clear the input field after successful bid
        } catch (error) {
            console.error('Error placing bid:', error);
            alert('Failed to place bid.  Check the console for details.');
            if (error.response) {
                console.error("Server Response:", error.response.data);
            }
        }
    };

    if (!product) {
        return (
            <div className="container mx-auto p-4">
                <p>Loading product details...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Place a Bid</h2>

            {/* Product Image and Description */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <img
                        src={product.imageUrl || "placeholder-image.jpg"}
                        alt={product.name || "Product Image"}
                        className="w-full h-auto object-cover rounded-lg"
                    />
                </div>
                <div>
                    <p className="text-gray-700">{product.description || "No description available."}</p>
                </div>
            </div>

            <form onSubmit={handleSubmitBid} className="max-w-md mx-auto">
                <div className="mb-4">
                    <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
                        Bid Amount ($):
                    </label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter your bid amount"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        min="0.01"
                        step="0.01"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Place Bid
                </button>
            </form>
        </div>
    );
};

export default PlaceBid;
