import { useState } from 'react';
import { usePosContext } from '../context/PosContext';
import MenuItemModal from './MenuItemModal';

export default function MenuManagement({ onBack }) {
  const { items, categories, addItem, updateItem, deleteItem, addCategory } = usePosContext();
  
  console.log('MenuManagement - Items:', items);
  console.log('MenuManagement - Categories:', categories);
  console.log('MenuManagement - Categories length:', categories?.length);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState('items');

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id) => {
    try {
      const result = await deleteItem(id);
      if (result.success) {
        setShowDeleteConfirm(null);
      } else {
        alert('Failed to delete item: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item');
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const result = await updateItem(item.id, {
        name: item.name,
        category: item.category,
        price: item.price,
        available: !item.available
      });
      if (!result.success) {
        alert('Failed to update status: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Failed to update status');
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        console.log('Adding category:', newCategory.trim());
        const result = await addCategory(newCategory.trim());
        console.log('Add category result:', result);
        setNewCategory('');
        alert('Category added successfully!');
      } catch (error) {
        console.error('Failed to add category:', error);
        alert('Failed to add category: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => onBack('pos')} 
          className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-semibold tracking-wider uppercase">Back</span>
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
          <button
            onClick={handleAddItem}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold shadow-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Item
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'items'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Menu Items
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Categories
          </button>
        </div>

        {/* Menu Items Tab */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items && items.length > 0 ? items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                        ₹{item.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              item.available !== false ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                item.available !== false ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`text-sm font-medium ${
                            item.available !== false ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {item.available !== false ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-yellow-600 hover:text-yellow-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(item.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-lg font-medium">No menu items found</p>
                          <p className="text-sm">Add your first menu item to get started</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Category</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Category name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Category
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories && categories.length > 0 ? categories.map((category, index) => (
                  <div key={index} className="px-4 py-2 bg-gray-100 rounded-lg text-center font-medium text-gray-700">
                    {category}
                  </div>
                )) : (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    <p>No categories found</p>
                    <p className="text-sm">Add your first category above</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Item</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this menu item?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteItem(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Menu Item Modal */}
        {isModalOpen && (
          <MenuItemModal
            item={editingItem}
            categories={categories}
            onSave={async (itemData) => {
              try {
                if (editingItem) {
                  const result = await updateItem(editingItem.id, itemData);
                  if (!result.success) {
                    alert('Failed to update item: ' + result.error);
                    return;
                  }
                } else {
                  const result = await addItem(itemData);
                  if (!result.success) {
                    alert('Failed to add item: ' + result.error);
                    return;
                  }
                }
                setIsModalOpen(false);
              } catch (error) {
                console.error('Failed to save item:', error);
                alert('Failed to save item');
              }
            }}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}