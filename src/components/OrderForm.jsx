import { useState, useEffect } from 'react';

export default function OrderForm({ onClose, onOrderCreated }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/items`);
        const data = await response.json();
        setItems(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);
  const [formData, setFormData] = useState({
    status: 'Pending'
  });
  const [selectedItems, setSelectedItems] = useState([]);

  const addItem = () => {
    setSelectedItems([...selectedItems, { itemId: '', categoryId: '', quantity: 1, price: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...selectedItems];
    if (field === 'itemId') {
      if (value === 'custom') {
        updated[index] = { 
          ...updated[index], 
          itemId: 'custom', 
          categoryId: 'custom', 
          price: 0, 
          name: '' 
        };
      } else {
        const item = items.find(i => i._id === value);
        updated[index] = { 
          ...updated[index], 
          itemId: value, 
          categoryId: item?.categoryId || '', 
          price: item?.price || 0, 
          name: item?.itemName || '' 
        };
      }
    } else {
      updated[index][field] = value;
    }
    setSelectedItems(updated);
  };

  const removeItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const orderData = {
      items: selectedItems.map(item => ({
        itemName: item.name,
        qty: parseInt(item.quantity),
        price: parseFloat(item.price)
      })),
      totalPrice: selectedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      status: formData.status
    };

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        onOrderCreated();
        onClose();
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>


          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">Items</label>
              <button type="button" onClick={addItem} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                Add Item
              </button>
            </div>
            
            {selectedItems.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-2 text-sm font-medium text-gray-700">
                <div>Item</div>
                <div>Quantity</div>
                <div>Price</div>
                <div>Action</div>
              </div>
            )}
            
            {selectedItems.map((item, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                <select
                  value={item.itemId}
                  onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="">Select Item</option>
                  {items.map(menuItem => (
                    <option key={menuItem._id} value={menuItem._id}>{menuItem.itemName} - ₹{menuItem.price}</option>
                  ))}
                  <option value="custom">Custom Item</option>
                </select>
                
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  className="border rounded px-2 py-1"
                  min="1"
                  required
                />
                
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', e.target.value)}
                  className="border rounded px-2 py-1"
                  step="0.01"
                  required
                />
                
                <button type="button" onClick={() => removeItem(index)} className="bg-red-600 text-white px-2 py-1 rounded text-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>



          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}