import { useState, useEffect } from 'react';
import { getAllMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, getDistinctCategories, addCategory } from '../services/api';

export default function MenuSetup() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  useEffect(() => {
    console.log('MenuSetup component mounted, fetching data...');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching menu items and categories...');
      const [itemsData, categoriesData] = await Promise.all([
        getAllMenuItems(),
        getDistinctCategories()
      ]);
      console.log('Items data:', itemsData);
      console.log('Categories data:', categoriesData);
      setProducts(itemsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditMode(false);
    setCurrentItem(null);
    setFormData({ name: '', price: '', category: '', image: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setCurrentItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image || '',
      description: item.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(id);
        alert('Item deleted successfully!');
        fetchData();
      } catch (error) {
        alert('Error deleting item: ' + error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateMenuItem(currentItem.id, formData);
        alert('Item updated successfully!');
      } else {
        await addMenuItem(formData);
        alert('Item added successfully!');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Error saving item: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-2xl font-bold text-gold-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-white">Menu Management</h1>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-2xl font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
          >
            Add New Item
          </button>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700">
          {/* Debug Info */}
          <div className="mb-4 p-4 bg-slate-700 rounded-2xl">
            <p className="text-white text-sm">Items Count: {products.length}</p>
            <p className="text-white text-sm">Categories Count: {categories.length}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-4 px-4 text-yellow-400 font-bold">Image</th>
                  <th className="text-left py-4 px-4 text-yellow-400 font-bold">Name</th>
                  <th className="text-left py-4 px-4 text-yellow-400 font-bold">Category</th>
                  <th className="text-left py-4 px-4 text-yellow-400 font-bold">Price</th>
                  <th className="text-left py-4 px-4 text-yellow-400 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">
                      No items found. Try adding some items first.
                    </td>
                  </tr>
                ) : (
                  products.map((item) => (
                  <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="py-4 px-4">
                      <img 
                        src={item.image || '/placeholder.jpg'} 
                        alt={item.name}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                    </td>
                    <td className="py-4 px-4 text-white font-medium">{item.name}</td>
                    <td className="py-4 px-4 text-slate-300">{item.category}</td>
                    <td className="py-4 px-4 text-yellow-400 font-bold">₹{item.price}</td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-3xl p-8 w-full max-w-md border border-slate-600">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editMode ? 'Edit Item' : 'Add New Item'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-slate-700 text-white rounded-2xl border border-slate-600 focus:border-yellow-400 outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full p-3 bg-slate-700 text-white rounded-2xl border border-slate-600 focus:border-yellow-400 outline-none"
                  required
                />
                <div className="space-y-2">
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      if (e.target.value === 'ADD_NEW') {
                        setShowCategoryInput(true);
                        setFormData({...formData, category: ''});
                      } else {
                        setFormData({...formData, category: e.target.value});
                        setShowCategoryInput(false);
                      }
                    }}
                    className="w-full p-3 bg-slate-700 text-white rounded-2xl border border-slate-600 focus:border-yellow-400 outline-none"
                    required={!showCategoryInput}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="ADD_NEW">+ Add New Category</option>
                  </select>
                  {showCategoryInput && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="New Category Name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 p-3 bg-slate-700 text-white rounded-2xl border border-slate-600 focus:border-yellow-400 outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (newCategory.trim()) {
                            try {
                              await addCategory(newCategory.trim());
                              setFormData({...formData, category: newCategory.trim()});
                              setNewCategory('');
                              setShowCategoryInput(false);
                              const updatedCategories = await getDistinctCategories();
                              setCategories(updatedCategories);
                            } catch (error) {
                              alert('Error adding category: ' + error.message);
                            }
                          }
                        }}
                        className="px-4 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors"
                      >
                        ✓
                      </button>
                    </div>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="Image URL"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full p-3 bg-slate-700 text-white rounded-2xl border border-slate-600 focus:border-yellow-400 outline-none"
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-slate-700 text-white rounded-2xl border border-slate-600 focus:border-yellow-400 outline-none h-24 resize-none"
                />
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-2xl font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
                  >
                    {editMode ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-slate-600 text-white rounded-2xl font-bold hover:bg-slate-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}