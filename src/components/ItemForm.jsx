import { useState, useEffect } from 'react';

export default function ItemForm({ onClose, onItemCreated }) {
  const [formData, setFormData] = useState({
    itemName: '',
    categoryId: '',
    price: '',
    qty: 1
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
        const data = await response.json();
        const allCats = Array.isArray(data) ? data : data.data || [];
        setCategories(allCats);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const itemData = {
      itemName: formData.itemName,
      categoryId: formData.categoryId,
      price: parseFloat(formData.price),
      qty: parseInt(formData.qty),
      isAvailable: true
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      
      if (response.ok) {
        alert('Item created successfully!');
        onItemCreated();
        onClose();
      } else {
        alert('Failed to create item');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Network error: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Item</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => setFormData({...formData, itemName: e.target.value})}
              className="border rounded-lg px-3 py-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              className="border rounded-lg px-3 py-2 w-full"
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>{category.categoryName?.replace(/"/g, '')}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="border rounded-lg px-3 py-2 w-full"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={formData.qty}
                onChange={(e) => setFormData({...formData, qty: e.target.value})}
                className="border rounded-lg px-3 py-2 w-full"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Create Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}