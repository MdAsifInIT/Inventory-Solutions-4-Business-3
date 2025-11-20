import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [address, setAddress] = useState({
        fullName: user?.name || '',
        addressLine1: '',
        city: '',
        state: '',
        zipCode: '',
        phone: ''
    });

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    const handleChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleRazorpayPayment = async (orderData) => {
        const res = await loadRazorpay();

        if (!res) {
            setError('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
        }

        // Create Razorpay Order
        const { data: paymentData } = await axios.post('/api/payments/create-order', {
            amount: cartTotal,
            currency: 'INR'
        });

        if (!paymentData.success) {
            setError('Failed to create payment order');
            setLoading(false);
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Replace with real key
            amount: paymentData.order.amount,
            currency: paymentData.order.currency,
            name: "AntiGravity Rental",
            description: "Gear Rental Payment",
            image: "https://via.placeholder.com/150", // Add logo here
            order_id: paymentData.order.id,
            handler: async function (response) {
                try {
                    const verifyRes = await axios.post('/api/payments/verify', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId: orderData._id
                    });

                    if (verifyRes.data.success) {
                        clearCart();
                        navigate('/order-success', { state: { orderId: orderData._id } });
                    }
                } catch (err) {
                    setError('Payment verification failed');
                }
            },
            prefill: {
                name: address.fullName,
                email: user.email,
                contact: address.phone
            },
            notes: {
                address: `${address.addressLine1}, ${address.city}`
            },
            theme: {
                color: "#4F46E5"
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        setLoading(false); // Modal is open, stop loading spinner
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const orderItems = cart.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                startDate: item.startDate,
                endDate: item.endDate,
                price: item.priceTier * item.quantity
            }));

            const payload = {
                items: orderItems,
                shippingAddress: address,
                totalAmount: cartTotal,
                paymentMethod: paymentMethod
            };

            // 1. Create Order in DB (Pending)
            const { data } = await axios.post('/api/orders', payload);
            
            if (data.success) {
                if (paymentMethod === 'Online') {
                    // 2. Trigger Razorpay Flow
                    await handleRazorpayPayment(data.data);
                } else {
                    // COD Flow
                    clearCart();
                    navigate('/order-success', { state: { orderId: data.data._id } });
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to place order');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Address Form */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                        <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                                    value={address.fullName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                                <input
                                    type="text"
                                    name="addressLine1"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                                    value={address.addressLine1}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                                        value={address.city}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        required
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                                        value={address.state}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        required
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                                        value={address.zipCode}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                                        value={address.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    id="cod"
                                    name="paymentMethod"
                                    type="radio"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={handlePaymentMethodChange}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                />
                                <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                                    Cash on Delivery (COD)
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="online"
                                    name="paymentMethod"
                                    type="radio"
                                    value="Online"
                                    checked={paymentMethod === 'Online'}
                                    onChange={handlePaymentMethodChange}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                />
                                <label htmlFor="online" className="ml-3 block text-sm font-medium text-gray-700">
                                    Online Payment (Razorpay)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="md:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600">Total Amount</span>
                            <span className="text-2xl font-bold text-indigo-600">₹{cartTotal}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            By placing this order, you agree to our rental terms and conditions.
                        </p>
                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={loading}
                            className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (paymentMethod === 'Online' ? 'Pay Now' : 'Place Order')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
