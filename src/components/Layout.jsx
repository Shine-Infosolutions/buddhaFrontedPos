import { useState } from 'react';
import { usePosContext } from '../context/PosContext';

export default function Layout({ 
  sidebar, 
  menuItems, 
  cart, 
  currentPage, 
  onPageChange 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart: cartItems } = usePosContext();
  
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Hamburger Menu */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <span className="text-xl">☰</span>
      </button>

      {/* Mobile Cart Icon */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg"
      >
        <span className="text-lg">🛒</span>
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
            {itemCount}
          </span>
        )}
      </button>

      {/* Sidebar Overlay - Mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:block
      `}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">RestaurantPOS</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-gray-100 rounded"
          >
            <span className="text-gray-600">✕</span>
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => {
                  onPageChange('pos');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'pos'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">🏪</span>
                <span className="font-medium">POS</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onPageChange('orders');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'orders'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">📋</span>
                <span className="font-medium">Orders</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* Menu Items Section */}
        <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
          {menuItems}
        </div>

        {/* Cart Overlay - Mobile/Tablet */}
        {isCartOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsCartOpen(false)}
          />
        )}

        {/* Cart Section */}
        <div className={`
          fixed lg:static right-0 top-0 h-full w-80 bg-white border-l border-gray-200 z-40 transform transition-transform duration-300
          ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          lg:block
        `}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">🛒</span>
              <h3 className="font-semibold text-gray-800">Cart</h3>
              {itemCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{itemCount}</span>
              )}
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <span className="text-gray-600">✕</span>
            </button>
          </div>
          {cart}
        </div>
      </div>
    </div>
  );
}