import { useState } from 'react';
import { usePosContext } from '../context/PosContext';
import AlertBox from './AlertBox';

export default function CartPanel({ onClose, onNavigateToOrders }) {
  const { cart, updateQuantity, removeFromCart, placeOrder } = usePosContext();
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    setShowConfirmation(true);
  };

  const confirmOrder = () => {
    // Place order in background
    placeOrder(notes);
    
    setNotes('');
    setShowConfirmation(false);
    if (onClose) onClose();
    
    // Navigate to All Orders page
    if (onNavigateToOrders) {
      onNavigateToOrders();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6">
        {cart.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-4">🛒</div>
            <p className="text-lg font-medium">Cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-800">{item.name}</h4>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">₹{item.price}</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="font-semibold text-lg px-3 py-1 bg-gray-100 rounded-lg">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right text-lg font-bold text-yellow-600 mt-2">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Footer */}
      <div className="p-6 border-t border-gray-200 bg-white space-y-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
          rows="3"
          placeholder="Order notes..."
        />
        
        <div className="flex justify-between items-center py-3 border-t border-gray-200">
          <span className="font-semibold text-gray-800 text-lg">Total:</span>
          <span className="text-2xl font-bold text-yellow-600">₹{total}</span>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={cart.length === 0}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 text-white py-4 rounded-lg font-semibold text-lg transition-colors disabled:cursor-not-allowed shadow-lg"
        >
          Place Order & Print KOT
        </button>
      </div>

      {showConfirmation && (
        <AlertBox
          message="Are you sure you want to place this order and print KOT?"
          onConfirm={confirmOrder}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}