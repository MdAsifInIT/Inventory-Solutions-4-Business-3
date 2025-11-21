import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { Trash2, Calendar, ShoppingBag } from 'lucide-react';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

export default function Cart() {
    const { cart, removeFromCart, cartTotal } = useCart();
    const navigate = useNavigate();

    const handleRemove = (index, productName) => {
        removeFromCart(index);
        toast.success(`${productName} removed from cart`);
    };

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <EmptyState
                    type="cart"
                    title="Your cart is empty"
                    description="Looks like you haven't added any equipment yet. Browse our catalog to find the perfect gear for your needs."
                    actionLabel="Browse Catalog"
                    onAction={() => navigate('/products')}
                />
            </div>
        );
    }

    return (
        <motion.div 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex items-center mb-8">
                <ShoppingBag className="mr-3 text-indigo-600" size={32} />
                <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                <span className="ml-3 text-lg text-gray-500">({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8">
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                        <AnimatePresence>
                            <ul className="divide-y divide-gray-200">
                                {cart.map((item, index) => (
                                    <motion.li 
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-6 flex flex-col sm:flex-row items-start sm:items-center hover:bg-gray-50 transition-colors"
                                    >
                                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden mb-4 sm:mb-0">
                                        {item.product.images && item.product.images[0] ? (
                                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                                        )}
                                    </div>
                                    
                                    <div className="ml-0 sm:ml-6 flex-1 w-full">
                                        <div className="flex justify-between">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                <Link to={`/products/${item.product._id}`}>{item.product.name}</Link>
                                            </h3>
                                            <p className="text-lg font-bold text-gray-900">₹{item.priceTier * item.quantity}</p>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{item.product.description.substring(0, 100)}...</p>
                                        
                                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                                                <Calendar size={14} className="mr-2" />
                                                <span>{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-medium mr-2">Qty:</span>
                                                {item.quantity}
                                            </div>
                                        </div>
                                    </div>

                                        <div className="ml-0 sm:ml-6 mt-4 sm:mt-0">
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleRemove(index, item.product.name)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                aria-label="Remove from cart"
                                            >
                                                <Trash2 size={20} />
                                            </motion.button>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </AnimatePresence>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                        <div className="flow-root">
                            <dl className="-my-4 text-sm divide-y divide-gray-200">
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-gray-600">Subtotal</dt>
                                    <dd className="font-medium text-gray-900">₹{cartTotal}</dd>
                                </div>
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-gray-600">Security Deposit (Refundable)</dt>
                                    <dd className="font-medium text-gray-900">₹0</dd>
                                </div>
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-base font-bold text-gray-900">Order Total</dt>
                                    <dd className="text-base font-bold text-gray-900">₹{cartTotal}</dd>
                                </div>
                            </dl>
                        </div>
                        
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
