import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccess() {
    const location = useLocation();
    const orderId = location.state?.orderId;

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <CheckCircle className="mx-auto h-24 w-24 text-green-500 mb-6" />
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Order Confirmed!</h1>
                <p className="text-xl text-gray-600 mb-8">
                    Thank you for your order. We'll contact you shortly to confirm delivery details.
                </p>
                {orderId && (
                    <div className="bg-gray-50 px-6 py-4 rounded-lg border border-gray-200 inline-block mb-8">
                        <span className="text-gray-500 text-sm uppercase tracking-wider">Order ID</span>
                        <p className="text-xl font-mono font-bold text-gray-900">{orderId}</p>
                    </div>
                )}
                <div className="space-x-4">
                    <Link 
                        to="/products" 
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Continue Shopping
                    </Link>
                    <Link 
                        to="/profile" 
                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        View My Orders
                    </Link>
                </div>
            </div>
        </div>
    );
}
