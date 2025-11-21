import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Calendar, Check, AlertCircle, ShoppingCart, ArrowLeft } from 'lucide-react';
import { ProductDetailSkeleton } from '../components/LoadingSkeleton';
import Button from '../components/Button';

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, calculateRentalPrice } = useCart();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState(null);
    const [estimatedPrice, setEstimatedPrice] = useState(0);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data } = await axios.get(`/api/products/${id}`);
            if (data.success) setProduct(data.data);
        } catch (err) {
            setError('Product not found');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (product && startDate && endDate) {
            const price = calculateRentalPrice(startDate, endDate, product.pricing);
            setEstimatedPrice(price * quantity);
        }
    }, [startDate, endDate, quantity, product]);

    const handleAddToCart = () => {
        if (!startDate || !endDate) {
            toast.error('Please select rental dates');
            return;
        }
        
        if (new Date(endDate) <= new Date(startDate)) {
            toast.error('End date must be after start date');
            return;
        }
        
        addToCart(product, quantity, startDate, endDate, estimatedPrice / quantity);
        toast.success(`${product.name} added to cart!`);
        navigate('/cart');
    };

    if (loading) return <ProductDetailSkeleton />;
    if (error || !product) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/products')}>Back to Catalog</Button>
        </div>
    );

    return (
        <motion.div 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                        {product.images && product.images.length > 0 ? (
                            <img 
                                src={product.images[0]} 
                                alt={product.name} 
                                className="w-full h-96 object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-96 flex items-center justify-center bg-gray-200 text-gray-400">
                                No Image Available
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Product Info */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <p className="text-sm text-gray-500 mb-6">SKU: {product.sku}</p>
                    
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="block text-2xl font-bold text-gray-900">₹{product.pricing.day}</span>
                            <span className="text-xs text-gray-500">Daily</span>
                        </div>
                        <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="block text-2xl font-bold text-gray-900">₹{product.pricing.week}</span>
                            <span className="text-xs text-gray-500">Weekly</span>
                        </div>
                        <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="block text-2xl font-bold text-gray-900">₹{product.pricing.month}</span>
                            <span className="text-xs text-gray-500">Monthly</span>
                        </div>
                    </div>

                    <div className="prose prose-indigo text-gray-600 mb-8">
                        <p>{product.description}</p>
                    </div>

                    {/* Rental Options */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Check Availability & Rent</h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input 
                                    type="date" 
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input 
                                    type="date" 
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <select 
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            >
                                {[...Array(Math.min(10, product.totalStock)).keys()].map(n => (
                                    <option key={n+1} value={n+1}>{n+1}</option>
                                ))}
                            </select>
                        </div>

                        <button 
                            onClick={handleAddToCart}
                            disabled={product.totalStock === 0}
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart className="mr-2" />
                            {product.totalStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        
                        {product.totalStock > 0 ? (
                            <p className="mt-4 flex items-center text-sm text-green-600">
                                <Check size={16} className="mr-1" />
                                {product.totalStock} units available in stock
                            </p>
                        ) : (
                            <p className="mt-4 flex items-center text-sm text-red-600">
                                <AlertCircle size={16} className="mr-1" />
                                Currently unavailable
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
