import { useState, useEffect } from 'react';
import { usePosContext } from '../context/PosContext';

export default function CategoryItemsView({ selectedCategory }) {
  const { addToCart } = usePosContext();
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    itemName: '',
    price: '',
    qty: 1,
    categoryId: ''
  });
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [itemQuantities, setItemQuantities] = useState({});

  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, itemsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/categories`),
          fetch(`${import.meta.env.VITE_API_URL}/items?limit=100`)
        ]);
        
        const catsData = await catsRes.json();
        const itemsData = await itemsRes.json();
        
        const allCats = Array.isArray(catsData) ? catsData : catsData.data || [];
        const allItems = Array.isArray(itemsData) ? itemsData : itemsData.data || [];
        
        setCategories(allCats);
        
        const matchedCategory = allCats.find(cat => {
          const catName = cat.categoryName?.replace(/"/g, '').toLowerCase();
          const selCat = selectedCategory.replace(/"/g, '').toLowerCase();
          return catName === selCat;
        });
        
        if (matchedCategory) {
          const filteredItems = allItems.filter(item => {
            const itemCatId = typeof item.categoryId === 'object' ? item.categoryId._id : item.categoryId;
            return itemCatId === matchedCategory._id;
          });
          setItems(filteredItems);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [selectedCategory]);

  const { customer, updateCustomer } = usePosContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const itemData = {
      categoryId: formData.categoryId,
      itemName: formData.itemName,
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
        setShowCreateItem(false);
        setFormData({ itemName: '', price: '', qty: 1, categoryId: '' });
        
        // Refresh items
        const itemsResponse = await fetch(`${import.meta.env.VITE_API_URL}/items`);
        const data = await itemsResponse.json();
        const allItems = Array.isArray(data) ? data : data.data || [];
        
        const matchedCategory = categories.find(cat => {
          const catName = cat.categoryName?.replace(/"/g, '').toLowerCase();
          const selCat = selectedCategory.replace(/"/g, '').toLowerCase();
          return catName === selCat;
        });
        
        if (matchedCategory) {
          const filteredItems = allItems.filter(item => {
            const itemCatId = typeof item.categoryId === 'object' ? item.categoryId._id : item.categoryId;
            return itemCatId === matchedCategory._id;
          });
          setItems(filteredItems);
        }
      }
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName })
      });
      
      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, newCategory]);
        alert('Category created successfully!');
        setShowCreateCategory(false);
        setCategoryName('');
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleAddToOrder = (item) => {
    const cartItem = {
      id: item._id,
      name: item.itemName,
      price: item.price,
      category: selectedCategory
    };
    
    addToCart(cartItem);
  };

  const updateQuantity = (itemId, quantity) => {
    setItemQuantities({ ...itemQuantities, [itemId]: Math.max(1, quantity) });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Customer Inputs */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
            <input
              type="text"
              placeholder="Customer Name"
              value={customer.name}
              onChange={(e) => updateCustomer({ name: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Mobile Number"
              value={customer.mobile}
              onChange={(e) => updateCustomer({ mobile: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
        </div>




        {/* Search Bar */}
        <div className="px-4 md:px-6 mb-4">
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        {/* Items Display */}
        {items.filter(item => 
          item.itemName?.toLowerCase().includes(searchQuery.toLowerCase())
        ).length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-0">
            {items.filter(item => 
              item.itemName?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((item) => (
              <div key={item._id} className="bg-white rounded-lg p-4 shadow-sm border text-center">
                <h3 className="font-bold text-lg mb-2 uppercase">{item.itemName?.replace(/"/g, '')}</h3>
                <p className="font-bold text-yellow-600 text-2xl mb-4">₹{item.price}</p>
                

                
                <button
                  onClick={() => handleAddToOrder(item)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  ADD TO ORDER
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <div className="text-gray-500 text-lg mb-6">No items found in this category</div>
          </div>
        )}

        {/* Create Item Form Modal */}
        {showCreateItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Create New Item</h3>
                {/* <button
                  type="button"
                  onClick={() => setShowCreateCategory(true)}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  + Category
                </button> */}
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>{category.categoryName}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2"
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
                      className="w-full border rounded-lg px-3 py-2"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateItem(false)}
                    className="flex-1 border rounded-lg px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2"
                  >
                    Create Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Category Modal */}
        {showCreateCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Create New Category</h3>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateCategory(false)}
                    className="flex-1 border rounded-lg px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2"
                  >
                    Create
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