import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            if (data.success) {
                setProducts(data.data);
            }
        } catch (err) {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p._id !== id));
            } catch (err) {
                alert('Failed to delete product');
            }
        }
    };

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                <Link 
                    to="/admin/products/new" 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
                >
                    <Plus size={20} />
                    <span>Add Product</span>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search products by name or SKU..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-medium">Product</th>
                                <th className="p-4 font-medium">SKU</th>
                                <th className="p-4 font-medium">Category</th>
                                <th className="p-4 font-medium">Stock</th>
                                <th className="p-4 font-medium">Price (Day)</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{product.name}</div>
                                    </td>
                                    <td className="p-4 text-gray-500">{product.sku}</td>
                                    <td className="p-4 text-gray-500">{product.category?.name || '-'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            product.totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {product.totalStock} Available
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-900">₹{product.pricing.day}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <Link 
                                            to={`/admin/products/edit/${product._id}`}
                                            className="text-indigo-600 hover:text-indigo-900 inline-block"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(product._id)}
                                            className="text-red-600 hover:text-red-900 inline-block"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        No products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
