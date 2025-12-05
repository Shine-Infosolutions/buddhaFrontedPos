import { useState, useEffect } from 'react';

export default function MenuItemModal({ item, categories, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    available: true
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        price: item.price || '',
        category: item.category || '',
        available: item.available !== false
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.price && formData.category) {
      onSave({
        ...formData,
        price: parseFloat(formData.price)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter item name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter price"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="">Select category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
            <label htmlFor="available" className="ml-2 text-sm font-medium text-gray-700">
              Available (In Stock)
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              {item ? 'Update' : 'Add'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}