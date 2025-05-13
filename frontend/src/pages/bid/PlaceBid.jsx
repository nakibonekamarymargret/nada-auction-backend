import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PlaceBid = () => {
    const { id: productId } = useParams(); // Get the product ID from the route
    const [amount, setAmount] = useState('');
    const [token] = useState(localStorage.getItem('token')); // Get the JWT token from localStorage
    const [product, setProduct] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:7107/product/${productId}`);
                const productData = res.data.ReturnObject;
                setProduct(productData);
            } catch (err) {
                console.error("Failed to fetch product data:", err);
                setMessage("Failed to fetch product details. Check the console for details.");
                setMessageType('error');
            }
        };

        fetchProduct();
    }, [productId]);
// Fetch participants for the product
    const fetchParticipants = async () => {
        try {
            const res = await axios.get(`http://localhost:7107/bids/product/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParticipants(res.data.ReturnObject);
        } catch (err) {
            console.error("Failed to fetch participants:", err);
        }
    };

    fetchParticipants();

    const handleSubmitBid = async (e) => {
        e.preventDefault();

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setMessage('Please enter a valid bid amount greater than zero.');
            setMessageType('error');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:7107/bids/place/${productId}`,
                { amount: Number(amount) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const successMsg = response.data?.ReturnObject?.message || 'Bid placed successfully!';
            setMessage(successMsg);
            setMessageType('success');
            setAmount('');
        } catch (error) {
            console.error('Error placing bid:', error);
            const errorMsg = error.response?.data?.ReturnObject?.message || 'Failed to place bid.';
            setMessage(errorMsg);
            setMessageType('error');
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

            {message && (
                <div
                    className={`mb-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Bid Form */}
                <div>
                    <img src={product.imageUrl || "placeholder.jpg"} alt={product.name}
                         className="w-full rounded-lg mb-4"/>
                    <p className="mb-4 text-gray-700">{product.description}</p>

                    <form onSubmit={handleSubmitBid}>
                        <label htmlFor="amount" className="block text-sm font-semibold mb-2">Bid Amount ($):</label>
                        <div className="flex mb-4">
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="flex-grow border rounded-l px-3 py-2"
                                min="0.01"
                                step="0.01"
                            />
                            <button
                                type="button"
                                onClick={() => setAmount((prev) => (Number(prev) + 1).toFixed(2))}
                                className="bg-gray-200 px-4 rounded-r hover:bg-gray-300"
                            >
                                +
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <button type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit
                            </button>
                            <button type="button" onClick={() => setAmount('')}
                                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Participants */}
                <div className="bg-white border rounded p-4 shadow-md">
                    <h3 className="text-lg font-bold mb-3">Participants</h3>
                    {participants.length === 0 ? (
                        <p>No bids yet.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {participants.map((p, index) => (
                                <li key={p.id} className="py-2 flex justify-between">
                                    <span>{index + 1}. {p.bidder?.name || 'Anonymous'}</span>
                                    <span className="font-semibold">${p.amount.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>

    );
};

export default PlaceBid;
