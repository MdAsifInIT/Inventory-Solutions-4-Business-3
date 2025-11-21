import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Filter, Search } from 'lucide-react';
import { ProductCardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function ProductCatalog() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const categoryFilter = searchParams.get('category');
    const searchTerm = searchParams.get('search') || '';

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [searchParams]);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('/api/categories');
            if (data.success) setCategories(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let query = '/api/products?';
            if (categoryFilter) query += `category=${categoryFilter}&`;
            // Note: Backend search implementation might be needed for 'search' param if not using client-side filtering
            // For now, we'll fetch all and filter client-side if needed, or assume backend supports basic filters
            
            const { data } = await axios.get(query);
            if (data.success) {
                let filtered = data.data;
                if (searchTerm) {
                    filtered = filtered.filter(p => 
                        p.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setProducts(filtered);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (catId) => {
        if (catId) {
            setSearchParams({ category: catId });
        } else {
            setSearchParams({});
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center space-x-2 mb-4 text-gray-900 font-bold">
                            <Filter size={20} />
                            <span>Filters</span>
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Categories</h3>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input 
                                        type="radio" 
                                        name="category" 
                                        className="text-indigo-600 focus:ring-indigo-500"
                                        checked={!categoryFilter}
                                        onChange={() => handleCategoryChange('')}
                                    />
                                    <span className="ml-2 text-gray-600 text-sm">All Categories</span>
                                </label>
                                {categories.map(cat => (
                                    <label key={cat._id} className="flex items-center">
                                        <input 
                                            type="radio" 
                                            name="category" 
                                            className="text-indigo-600 focus:ring-indigo-500"
                                            checked={categoryFilter === cat._id}
                                            onChange={() => handleCategoryChange(cat._id)}
                                        />
                                        <span className="ml-2 text-gray-600 text-sm">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Equipment Catalog</h1>
                        <p className="text-gray-500">{products.length} items found</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <ProductCardSkeleton key={n} />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <EmptyState
                            type="products"
                            title="No products found"
                            description="We couldn't find any products matching your criteria. Try adjusting your filters or search terms."
                            actionLabel="Clear Filters"
                            onAction={() => setSearchParams({})}
                        />
                    ) : (
                        <motion.div 
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {products.map((product, index) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Link 
                                        to={`/products/${product._id}`} 
                                        className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="aspect-w-4 aspect-h-3 bg-gray-200 relative overflow-hidden">
                                            {product.images && product.images.length > 0 ? (
                                                <img 
                                                    src={product.images[0]} 
                                                    alt={product.name} 
                                                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-48 flex items-center justify-center text-gray-400">
                                                    <Search size={48} />
                                                </div>
                                            )}
                                            {product.totalStock === 0 && (
                                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                                                    Out of Stock
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-lg font-bold text-gray-900">₹{product.pricing.day}</span>
                                                    <span className="text-xs text-gray-500">/day</span>
                                                </div>
                                                <span className="text-indigo-600 text-sm font-medium group-hover:underline">View Details →</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
