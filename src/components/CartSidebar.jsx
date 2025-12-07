import { useState } from 'react';
import { usePosContext } from '../context/PosContext';
import AlertBox from './AlertBox';
import logoImg from '../assets/buddha-logo.png';

export default function CartSidebar({ isOpen, onClose, isDesktop = false, onNavigateToOrders }) {
  const { cart, updateQuantity, removeFromCart, clearCart, placeOrder, customer, updateCustomer } = usePosContext();
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    setShowConfirmation(true);
  };

  const confirmOrder = async () => {
    setIsPlacingOrder(true);
    const result = await placeOrder(notes, customer, paymentMethod);
    
    setOrderMessage(result.message);
    setIsPlacingOrder(false);
    
    if (result.success) {
      setNotes('');
      setShowConfirmation(false);
      
      // Print KOT
      if (result.order) {
        printKOT(result.order);
      }
      
      setTimeout(() => {
        setOrderMessage('');
        if (!isDesktop) onClose();
      }, 2000);
    } else {
      setTimeout(() => setOrderMessage(''), 3000);
    }
  };

  const printKOT = (order) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/buddha-logo.svg';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const logoBase64 = canvas.toDataURL('image/png');
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>KOT</title>
            <style>
              @page { size: 80mm auto; margin: 2mm; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Courier New', monospace; font-size: 12px; width: 76mm; padding: 2mm; line-height: 1.3; }
              .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 3mm; margin-bottom: 3mm; }
              .logo { width: 20mm; height: 20mm; margin: 0 auto 2mm; object-fit: contain; }
              .restaurant-name { font-size: 16px; font-weight: bold; margin-bottom: 1mm; letter-spacing: 1px; }
              .title { font-size: 18px; font-weight: bold; margin-bottom: 2mm; }
              .info { margin: 1mm 0; font-size: 11px; }
              .items { margin: 3mm 0; }
              .item-row { display: flex; justify-content: space-between; margin: 1.5mm 0; font-size: 11px; }
              .footer { border-top: 2px dashed #000; padding-top: 3mm; margin-top: 3mm; text-align: center; font-size: 11px; }
              @media print { body { width: 76mm; } }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="/buddha-logo.svg" alt="Buddha Logo" class="logo" />
              <div class="restaurant-name">BUDDHA AVENUE</div>
              <div class="title">KOT</div>
              <div class="info">Order #${(order._id || order.id || '').slice(-8)}</div>
              <div class="info">${new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</div>
            </div>
            <div class="info"><strong>Customer:</strong> ${order.customerName || customer.name || 'Guest'}</div>
            <div class="info"><strong>Mobile:</strong> ${order.customerMobile || customer.mobile || 'N/A'}</div>
            <div class="items">
              <div style="border-bottom: 1px solid #000; margin: 2mm 0;"></div>
              ${cart.map(item => `
                <div class="item-row">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>₹${item.price}</span>
                </div>
              `).join('')}
              <div style="border-bottom: 1px solid #000; margin: 2mm 0;"></div>
            </div>
            <div class="item-row" style="font-weight: bold; font-size: 14px;">
              <span>TOTAL</span>
              <span>₹${total}</span>
            </div>
            <div class="footer">
              <div><strong>Status:</strong> Completed</div>
              <div style="margin-top: 2mm;">Thank You!</div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() { window.print(); }, 250);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    };
    
    img.onerror = () => {
      console.error('Logo failed to load');
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>KOT</title>
            <style>
              @page { size: 80mm auto; margin: 2mm; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Courier New', monospace; font-size: 12px; width: 76mm; padding: 2mm; line-height: 1.3; }
              .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 3mm; margin-bottom: 3mm; }
              .restaurant-name { font-size: 16px; font-weight: bold; margin-bottom: 1mm; letter-spacing: 1px; }
              .title { font-size: 18px; font-weight: bold; margin-bottom: 2mm; }
              .info { margin: 1mm 0; font-size: 11px; }
              .items { margin: 3mm 0; }
              .item-row { display: flex; justify-content: space-between; margin: 1.5mm 0; font-size: 11px; }
              .footer { border-top: 2px dashed #000; padding-top: 3mm; margin-top: 3mm; text-align: center; font-size: 11px; }
              @media print { body { width: 76mm; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="restaurant-name">BUDDHA AVENUE</div>
              <div class="title">KOT</div>
              <div class="info">Order #${(order._id || order.id || '').slice(-8)}</div>
              <div class="info">${new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</div>
            </div>
            <div class="info"><strong>Customer:</strong> ${order.customerName || customer.name || 'Guest'}</div>
            <div class="info"><strong>Mobile:</strong> ${order.customerMobile || customer.mobile || 'N/A'}</div>
            <div class="items">
              <div style="border-bottom: 1px solid #000; margin: 2mm 0;"></div>
              ${cart.map(item => `
                <div class="item-row">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>₹${item.price}</span>
                </div>
              `).join('')}
              <div style="border-bottom: 1px solid #000; margin: 2mm 0;"></div>
            </div>
            <div class="item-row" style="font-weight: bold; font-size: 14px;">
              <span>TOTAL</span>
              <span>₹${total}</span>
            </div>
            <div class="footer">
              <div><strong>Status:</strong> Completed</div>
              <div style="margin-top: 2mm;">Thank You!</div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() { window.print(); }, 250);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    };
  };

  const handleClearCart = () => {
    clearCart();
  };

  // Desktop static mode - always render
  if (isDesktop) {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header - Desktop Static */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg">Shopping Cart</h3>
            <button 
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
              disabled={cart.length === 0}
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-500 mt-2">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                      <p className="text-gray-600 text-xs">₹{item.price} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 bg-white rounded-full px-2 py-1 border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800 font-bold transition-colors"
                      >
                        −
                      </button>
                      <span className="font-semibold text-gray-800 text-sm min-w-[16px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-bold text-yellow-600">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Notes */}
        {cart.length > 0 && (
          <div className="px-4 pb-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-sm"
              rows="2"
              placeholder="Special instructions..."
            />
          </div>
        )}

        {/* Sticky Bottom Footer */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-4 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-base font-bold text-gray-800">
                <span>Total</span>
                <span className="text-yellow-600">₹{total}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
              </select>
            </div>

            {orderMessage && (
              <div className={`text-center p-2 rounded-lg mb-3 text-sm ${orderMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {orderMessage}
              </div>
            )}
            
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg min-h-[44px] flex items-center justify-center"
            >
              {isPlacingOrder ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </>
              ) : (
                'Place Order & Print KOT'
              )}
            </button>
          </div>
        )}

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

  // Mobile drawer mode
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Cart Drawer */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-50 transition-transform duration-300 flex flex-col">
        
        {/* Header - Mobile Drawer */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h3 className="font-bold text-gray-800 text-lg">Shopping Cart</h3>
          
          <button 
            onClick={handleClearCart}
            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
            disabled={cart.length === 0}
          >
            Clear Cart
          </button>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-500 mt-2">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-base">{item.name}</h4>
                      <p className="text-gray-600 text-sm">₹{item.price} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-3 py-2 border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-800 font-bold transition-colors"
                      >
                        −
                      </button>
                      <span className="font-semibold text-gray-800 min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-800 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-600">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Notes */}
        {cart.length > 0 && (
          <div className="px-4 pb-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-sm"
              rows="2"
              placeholder="Special instructions..."
            />
          </div>
        )}

        {/* Sticky Bottom Footer */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span>
                <span className="text-yellow-600">₹{total}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
              </select>
            </div>

            {orderMessage && (
              <div className={`text-center p-2 rounded-lg mb-3 text-sm ${orderMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {orderMessage}
              </div>
            )}
            
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg min-h-[48px] flex items-center justify-center"
            >
              {isPlacingOrder ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </>
              ) : (
                'Place Order & Print KOT'
              )}
            </button>
          </div>
        )}

        {showConfirmation && (
          <AlertBox
            message="Are you sure you want to place this order and print KOT?"
            onConfirm={confirmOrder}
            onCancel={() => setShowConfirmation(false)}
          />
        )}
      </div>
    </>
  );
}