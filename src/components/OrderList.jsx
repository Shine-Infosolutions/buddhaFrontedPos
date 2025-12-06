import { useState, useEffect } from 'react';
import { usePosContext } from '../context/PosContext';
import AlertBox from './AlertBox';
import OrderForm from './OrderForm';
import ItemForm from './ItemForm';

export default function OrderList({ onOpenCart }) {
  const { updateOrderById } = usePosContext();
  const [orders, setOrders] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: limit
        });
        
        if (searchTerm) params.append('search', searchTerm);
        
        const url = `${import.meta.env.VITE_API_URL}/orders?${params.toString()}`;
        console.log('=== FETCH DEBUG ===');
        console.log('Search term:', searchTerm);
        console.log('Current page:', currentPage);
        console.log('Limit:', limit);
        console.log('Params object:', Object.fromEntries(params));
        console.log('Params string:', params.toString());
        console.log('Full URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const data = await response.json();
        console.log('Raw response data:', data);
        console.log('Orders array:', data.data);
        console.log('Orders count:', data.data?.length || 0);
        console.log('Total pages:', data.totalPages);
        console.log('Current page from response:', data.page);
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setOrders(data);
          setTotalPages(Math.ceil(data.length / limit));
        } else {
          setOrders(data.data || data.orders || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    const timeoutId = setTimeout(() => {
      fetchOrders();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [currentPage, limit, searchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const handleSearch = async () => {
    console.log('=== MANUAL SEARCH TRIGGERED ===');
    console.log('Search term:', searchTerm);
    
    // Force a re-fetch with current search term
    try {
      const params = new URLSearchParams({
        page: 1,
        limit: limit
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const url = `${import.meta.env.VITE_API_URL}/orders?${params.toString()}`;
      console.log('=== SEARCH DEBUG ===');
      console.log('Search term (raw):', `"${searchTerm}"`);
      console.log('Search term (trimmed):', `"${searchTerm.trim()}"`);
      console.log('Search term length:', searchTerm.length);
      console.log('Params entries:', [...params.entries()]);
      console.log('Manual search URL:', url);
      console.log('Expected URL should be:', `${import.meta.env.VITE_API_URL}/orders?search=mukesh&page=1&limit=10`);
      
      const response = await fetch(url);
      const data = await response.json();
      console.log('Manual search response:', data);
      
      if (Array.isArray(data)) {
        setOrders(data);
        setTotalPages(Math.ceil(data.length / limit));
      } else {
        setOrders(data.data || data.orders || []);
        setTotalPages(data.totalPages || 1);
      }
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching orders:', error);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await updateOrderById(orderId, { status: 'completed' });
      refreshOrders();
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const handleCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowAlert(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          refreshOrders();
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const confirmCancel = async () => {
    try {
      await updateOrderById(selectedOrderId, { status: 'cancelled' });
      refreshOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
    setShowAlert(false);
    setSelectedOrderId(null);
  };

  const refreshOrders = async () => {
    const params = new URLSearchParams({
      page: currentPage,
      limit: limit
    });
    
    if (searchTerm) params.append('search', searchTerm);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/orders?${params.toString()}`);
    const data = await response.json();
    
    // Handle different response formats
    if (Array.isArray(data)) {
      setOrders(data);
      setTotalPages(Math.ceil(data.length / limit));
    } else {
      setOrders(data.data || data.orders || []);
      setTotalPages(data.totalPages || 1);
    }
  };

  const handlePrintKOT = (order) => {
    // Create KOT content
    const kotContent = `================= KOT =================
Order ID     : #${order._id || order.orderId || order.id}
Customer     : ${order.customerName || 'Guest'}
Mobile       : ${order.customerMobile || 'N/A'}
Date & Time  : ${order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()}
========================================
ITEMS
----------------------------------------
Qty     Item Name                Amount
----------------------------------------
${order.items?.map(item => `${item.qty}       ${item.itemName.padEnd(20)}   ${item.price}`).join('\n') || 'No items'}
----------------------------------------
Total Amount:                    ${order.totalAmount || order.totalPrice || 0}
Status      : ${order.status || 'pending'}
========================================
Thank you!
========================================`;
    
    // Print KOT
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>KOT - Order #${order._id || order.id}</title>
          <style>
            @page { 
              size: 80mm auto; 
              margin: 4mm; 
            }
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              margin: 0; 
              padding: 0;
              width: 72mm;
              line-height: 1.2;
            }
            pre { 
              white-space: pre-wrap; 
              margin: 0;
              font-family: inherit;
            }
            @media print {
              body { height: auto !important; }
            }
          </style>
        </head>
        <body>
          <pre>${kotContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleShowOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Header Section */}
      <div className="flex-none p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">All Orders</h1>
            <p className="text-gray-600">Manage and track all restaurant orders</p>
          </div>
          <button
            onClick={() => setShowOrderForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Order
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="px-6 mb-4">
        <div className="max-w-md flex gap-2">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date&Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders && orders.length > 0 ? orders.map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleShowOrderDetails(order)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        #{order._id || order.id}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.items?.length || 0} items</div>
                      <div className="text-xs text-gray-500">
                        {order.items?.slice(0, 2).map(item => item.itemName).join(', ')}
                        {order.items?.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                      ₹{order.totalAmount || order.totalPrice || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderDateTime ? new Date(order.orderDateTime).toLocaleString() : order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePrintKOT(order)}
                          className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-1 rounded text-xs font-medium"
                          title="Print KOT"
                        >
                          Print KOT
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order._id || order.id)}
                          className="bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded text-xs font-medium"
                          title="Cancel Order"
                          disabled={order.status === 'cancelled' || order.status === 'completed'}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-lg font-medium">No orders found</p>
                        <p className="text-sm">Orders will appear here once customers start placing them</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 py-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
      
        {showAlert && (
          <AlertBox
            message="Are you sure you want to cancel this order?"
            onConfirm={confirmCancel}
            onCancel={() => setShowAlert(false)}
          />
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Order Details - #{selectedOrder._id || selectedOrder.id}</h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <p className="text-gray-900">{selectedOrder.customerName || 'Guest'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                    <p className="text-gray-900">{selectedOrder.customerMobile || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedOrder.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedOrder.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedOrder.status || 'pending'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-gray-900">{selectedOrder.orderDateTime ? new Date(selectedOrder.orderDateTime).toLocaleString() : selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.itemName}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.qty}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">₹{item.price}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">₹{item.qty * item.price}</td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan="4" className="px-4 py-2 text-center text-gray-500">No items</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>₹{selectedOrder.totalPrice || 0}</span>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handlePrintKOT(selectedOrder)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Print KOT
                  </button>
                  <button
                    onClick={() => {
                      handleCancelOrder(selectedOrder._id || selectedOrder.id);
                      setShowOrderDetails(false);
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'completed'}
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showOrderForm && (
          <OrderForm
            onClose={() => setShowOrderForm(false)}
            onOrderCreated={refreshOrders}
          />
        )}

        {showItemForm && (
          <ItemForm
            onClose={() => setShowItemForm(false)}
            onItemCreated={() => console.log('Item created')}
          />
        )}
    </div>
  );
}