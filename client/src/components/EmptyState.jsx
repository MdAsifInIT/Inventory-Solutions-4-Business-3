import { motion } from 'framer-motion';
import { PackageOpen, ShoppingCart, ClipboardList } from 'lucide-react';

const icons = {
  products: PackageOpen,
  cart: ShoppingCart,
  orders: ClipboardList,
};

export default function EmptyState({ 
  type = 'products',
  title, 
  description, 
  actionLabel, 
  onAction 
}) {
  const Icon = icons[type] || PackageOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6"
      >
        <Icon size={48} className="text-gray-400" />
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
