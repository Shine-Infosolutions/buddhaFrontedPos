import React, { useState, useEffect } from 'react';

const CompletePOS = () => {
  // State Management
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [customer, setCustomer] = useState({ name: '', phone: '' });

  // Sample Menu Data
  const menuItems = [
    { id: 1, name: 'Margherita Pizza', category: 'Pizza', price: 299, image: '🍕' },
    { id: 2, name: 'Chicken Burger', category: 'Burgers', price: 199, image: '🍔' },
    { id: 3, name: 'Caesar Salad', category: 'Salads', price: 149, image: '🥗' },
    { id: 4, name: 'Pepperoni Pizza', category: 'Pizza', price: 349, image: '🍕' },
    { id: 5, name: 'Fish Burger', category: 'Burgers', price: 229, image: '🍔' },
    { id: 6, name: 'Greek Salad', category: 'Salads', price: 179, image: '🥗' },
    { id: 7, name: 'Coke', category: 'Beverages', price: 49, image: '🥤' },
    { id: 8, name: 'Coffee', category: 'Beverages', price: 79, image: '☕' }
  ];

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Cart Functions
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCustomer({ name: '', phone: '' });
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  // Order Functions
  const placeOrder = () => {
    if (cart.length === 0) return;
    
    const order = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      customer,
      items: [...cart],
      subtotal,
      tax,
      total
    };
    
    setOrders([order, ...orders]);
    setCurrentOrder(order);
    clearCart();
    
    // Trigger print
    setTimeout(() => window.print(), 100);
  };

  const reprintOrder = (order) => {
    setCurrentOrder(order);
    setTimeout(() => window.print(), 100);
  };

  const sendWhatsApp = (order) => {
    const message = `*Order Receipt*\n\nOrder ID: ${order.id}\nDate: ${order.date}\nCustomer: ${order.customer.name}\nPhone: ${order.customer.phone}\n\n*Items:*\n${order.items.map(item => `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`).join('\n')}\n\nSubtotal: ₹${order.subtotal}\nTax (18%): ₹${order.tax.toFixed(2)}\n*Total: ₹${order.total.toFixed(2)}*\n\nThank you for your order!`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <>
      <div className="flex h-screen bg-gray-100 print:hidden">
        {/* Sidebar - Categories */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-800">Restaurant POS</h1>
          </div>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left p-3 mb-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
            <button
              onClick={() => setShowOrders(true)}
              className="w-full text-left p-3 mt-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              📋 All Orders
            </button>
          </div>
        </div>

        {/* Main Area - Menu Items */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">{selectedCategory} Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-2 text-center">{item.image}</div>
                <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-2">{item.category}</p>
                <p className="text-xl font-bold text-green-600 mb-4">₹{item.price}</p>
                <button
                  onClick={() => addToCart(item)}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Cart */}
        <div className="w-96 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Cart ({cart.length})</h2>
          </div>
          
          {/* Customer Details */}
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Customer Name"
              value={customer.name}
              onChange={(e) => setCustomer({...customer, name: e.target.value})}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={customer.phone}
              onChange={(e) => setCustomer({...customer, phone: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center">Cart is empty</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-gray-600">₹{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 bg-gray-500 text-white rounded-full hover:bg-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={placeOrder}
                disabled={!customer.name || !customer.phone}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Place Order & Print KOT
              </button>
              <button
                onClick={clearCart}
                className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors mt-2"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders Modal */}
      {showOrders && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">All Orders</h2>
              <button
                onClick={() => setShowOrders(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold">Order #{order.id}</h3>
                        <p className="text-gray-600">{order.date}</p>
                        <p className="text-gray-600">{order.customer.name} - {order.customer.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => sendWhatsApp(order)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            📱 WhatsApp
                          </button>
                          <button
                            onClick={() => reprintOrder(order)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            🖨️ Reprint
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.items.map(item => (
                        <span key={item.id} className="mr-4">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Print Receipt */}
      {currentOrder && (
        <div className="hidden print:block print:p-0 print:m-0">
          <div className="receipt">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold">🍽️ RESTAURANT POS</h1>
              <p className="text-sm">Premium Dining Experience</p>
              <div className="dashed-line"></div>
            </div>
            
            <div className="mb-4">
              <p><strong>Order ID:</strong> {currentOrder.id}</p>
              <p><strong>Date:</strong> {currentOrder.date}</p>
              <p><strong>Customer:</strong> {currentOrder.customer.name}</p>
              <p><strong>Phone:</strong> {currentOrder.customer.phone}</p>
              <div className="dashed-line"></div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between font-bold mb-2">
                <span>ITEM</span>
                <span>QTY</span>
                <span>PRICE</span>
              </div>
              <div className="dashed-line"></div>
              {currentOrder.items.map(item => (
                <div key={item.id} className="flex justify-between mb-1">
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <span className="w-16 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="dashed-line"></div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{currentOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%):</span>
                <span>₹{currentOrder.tax.toFixed(2)}</span>
              </div>
              <div className="dashed-line"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL:</span>
                <span>₹{currentOrder.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-center text-sm">
              <div className="dashed-line"></div>
              <p>Thank you for dining with us!</p>
              <p>Visit us again soon</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media print {
          * {
            visibility: hidden;
          }
          
          .receipt, .receipt * {
            visibility: visible;
          }
          
          .receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            color: black;
            background: white;
            padding: 10px;
            margin: 0;
          }
          
          .dashed-line {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
        }
        
        .dashed-line {
          border-top: 1px dashed #ccc;
          margin: 8px 0;
        }
      `}</style>
    </>
  );
};

export default CompletePOS;