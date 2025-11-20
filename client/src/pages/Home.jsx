import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Laptop, Speaker } from 'lucide-react';

export default function Home() {
    return (
        <div>
            {/* Hero Section */}
            <div className="relative bg-indigo-900 text-white overflow-hidden">
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                        alt="Camera Gear" 
                        className="w-full h-full object-cover opacity-30"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                        Rent the Best Gear.<br />Create Your Masterpiece.
                    </h1>
                    <p className="text-xl text-indigo-200 max-w-2xl mb-10">
                        Access premium cameras, lenses, lighting, and audio equipment for your next project. Flexible rentals, competitive rates.
                    </p>
                    <div className="flex space-x-4">
                        <Link 
                            to="/products" 
                            className="bg-white text-indigo-900 px-8 py-3 rounded-md font-bold text-lg hover:bg-indigo-50 transition-colors"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Link to="/products?category=cameras" className="group relative rounded-lg overflow-hidden shadow-lg aspect-w-3 aspect-h-2">
                        <div className="bg-gray-200 h-64 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                            <Camera size={64} className="text-gray-400 group-hover:text-indigo-600" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                            <h3 className="text-white text-2xl font-bold">Cameras</h3>
                        </div>
                    </Link>
                    <Link to="/products?category=lenses" className="group relative rounded-lg overflow-hidden shadow-lg aspect-w-3 aspect-h-2">
                        <div className="bg-gray-200 h-64 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                            <Laptop size={64} className="text-gray-400 group-hover:text-indigo-600" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                            <h3 className="text-white text-2xl font-bold">Lenses</h3>
                        </div>
                    </Link>
                    <Link to="/products?category=lighting" className="group relative rounded-lg overflow-hidden shadow-lg aspect-w-3 aspect-h-2">
                        <div className="bg-gray-200 h-64 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                            <Speaker size={64} className="text-gray-400 group-hover:text-indigo-600" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                            <h3 className="text-white text-2xl font-bold">Lighting</h3>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-gray-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Flexible Rentals</h3>
                            <p className="text-gray-600">Rent by the day, week, or month. Extend anytime.</p>
                        </div>
                        <div className="p-6">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Quality Verified</h3>
                            <p className="text-gray-600">Every item is inspected and cleaned before every rental.</p>
                        </div>
                        <div className="p-6">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Best Rates</h3>
                            <p className="text-gray-600">Competitive pricing with discounts for longer durations.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
