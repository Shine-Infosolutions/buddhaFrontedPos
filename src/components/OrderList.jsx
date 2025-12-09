import { useState, useEffect } from 'react';
import { usePosContext } from '../context/PosContext';
import AlertBox from './AlertBox';
import OrderForm from './OrderForm';
import ItemForm from './ItemForm';
import logoImg from '../assets/buddha-logo.png';

export default function OrderList({ onOpenCart }) {
  const { updateOrderById } = usePosContext();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
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
  const [showEditOrder, setShowEditOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  const [itemSearch, setItemSearch] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let url = `${import.meta.env.VITE_API_URL}/orders?page=${currentPage}&limit=${limit}`;
        
        if (searchTerm && searchTerm.trim()) {
          url += `&search=${encodeURIComponent(searchTerm.trim())}`;
        }
        
        console.log('Fetching URL:', url);
        const response = await fetch(url);
        const data = await response.json();
        console.log('Response:', data);
        
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

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders?limit=10000`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setAllOrders(data);
        } else {
          setAllOrders(data.data || data.orders || []);
        }
      } catch (error) {
        console.error('Error fetching all orders:', error);
      }
    };
    fetchAllOrders();
  }, [orders]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
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
    let url = `${import.meta.env.VITE_API_URL}/orders?page=${currentPage}&limit=${limit}`;
    
    if (searchTerm && searchTerm.trim()) {
      url += `&search=${encodeURIComponent(searchTerm.trim())}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      setOrders(data);
      setTotalPages(Math.ceil(data.length / limit));
    } else {
      setOrders(data.data || data.orders || []);
      setTotalPages(data.totalPages || 1);
    }
  };

  const handlePrintKOT = (order) => {
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
            @page { 
              size: 80mm auto; 
              margin: 2mm; 
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              width: 76mm;
              padding: 2mm;
              line-height: 1.3;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 3mm;
              margin-bottom: 3mm;
            }
            .logo { width: 20mm; height: 20mm; margin: 0 auto 2mm; }
            .restaurant-name { font-size: 16px; font-weight: bold; margin-bottom: 1mm; letter-spacing: 1px; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 2mm; }
            .info { margin: 1mm 0; font-size: 11px; }
            .items { margin: 3mm 0; }
            .item-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 1.5mm 0; 
              font-size: 11px;
            }
            .footer {
              border-top: 2px dashed #000;
              padding-top: 3mm;
              margin-top: 3mm;
              text-align: center;
              font-size: 11px;
            }
            @media print {
              body { width: 76mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/buddha-logo.svg" alt="Buddha Logo" class="logo" />
            <div class="restaurant-name">BUDDHA AVENUE</div>
            <div class="title">KOT</div>
            <div class="info">Order #${(order._id || order.id).slice(-8)}</div>
            <div class="info">${new Date(order.createdAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</div>
          </div>
          <div class="info"><strong>Customer:</strong> ${order.customerName || 'Guest'}</div>
          <div class="info"><strong>Mobile:</strong> ${order.customerMobile || 'N/A'}</div>
          <div class="items">
            <div style="border-bottom: 1px solid #000; margin: 2mm 0;"></div>
            ${order.items?.map(item => `
              <div class="item-row">
                <span>${item.qty}x ${item.itemName?.replace(/"/g, '')}</span>
                <span>₹${item.qty * item.price}</span>
              </div>
            `).join('') || '<div>No items</div>'}
            <div style="border-bottom: 1px solid #000; margin: 2mm 0;"></div>
          </div>
          <div class="item-row" style="font-weight: bold; font-size: 14px;">
            <span>TOTAL</span>
            <span>₹${order.totalAmount || order.totalPrice || 0}</span>
          </div>
          <div class="footer">
            <div><strong>Status:</strong> ${order.status || 'pending'}</div>
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
              <div class="info">Order #${(order._id || order.id).slice(-8)}</div>
              <div class="info">${new Date(order.createdAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</div>
            </div>
            <div class="info"><strong>Customer:</strong> ${order.customerName || 'Guest'}</div>
            <div class="info"><strong>Mobile:</strong> ${order.customerMobile || 'N/A'}</div>
            <div class="items">
              <div style="border-bottom: 1px solid #000; margin: 2mm 0;"></div>
              ${order.items?.map(item => `
                <div class="item-row">
                  <span>${item.qty}x ${item.itemName?.replace(/"/g, '')}</span>
                  <span>₹${item.qty * item.price}</span>
                </div>
              `).join('') || '<div>No items</div>'}
              <div style="border-bottom: 1px solid #000; margin: 2mm 0;"></div>
            </div>
            <div class="item-row" style="font-weight: bold; font-size: 14px;">
              <span>TOTAL</span>
              <span>₹${order.totalAmount || order.totalPrice || 0}</span>
            </div>
            <div class="footer">
              <div><strong>Status:</strong> ${order.status || 'pending'}</div>
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

  const handleShowOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleEditOrder = async (order) => {
    setEditingOrder(JSON.parse(JSON.stringify(order)));
    setShowEditOrder(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items?limit=1000`);
      const data = await response.json();
      setAvailableItems(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const totalOrders = allOrders.length;
  const cancelledOrders = allOrders.filter(order => order.status?.toLowerCase() === 'cancelled').length;
  const completedOrders = allOrders.filter(order => order.status?.toLowerCase() === 'completed').length;
  const totalRevenue = allOrders
    .filter(order => order.status?.toLowerCase() === 'completed')
    .reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0);
  const cashOrders = allOrders.filter(order => order.status?.toLowerCase() === 'completed' && order.paymentMethod === 'Cash');
  const cashPayments = cashOrders.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0);
  const onlineOrders = allOrders.filter(order => order.status?.toLowerCase() === 'completed' && order.paymentMethod === 'Online');
  const onlinePayments = onlineOrders.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Header Section */}
      <div className="flex-none p-2 sm:p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">All Orders</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Manage and track all restaurant orders</p>
          </div>
          <button
            onClick={() => setShowOrderForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base whitespace-nowrap"
          >
            Create Order
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-2">
          <div className="bg-white rounded shadow p-2">
            <div className="text-[10px] text-gray-600 mb-0.5">Total</div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{totalOrders}</div>
          </div>
          <div className="bg-white rounded shadow p-2">
            <div className="text-[10px] text-gray-600 mb-0.5">Done</div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-green-600">{completedOrders}</div>
          </div>
          <div className="bg-white rounded shadow p-2">
            <div className="text-[10px] text-gray-600 mb-0.5">Cancel</div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-red-600">{cancelledOrders}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded shadow p-2 text-white">
            <div className="text-[10px] mb-0.5 opacity-90">Revenue</div>
            <div className="text-base sm:text-lg md:text-xl font-bold">₹{totalRevenue}</div>
          </div>
          <div className="bg-white rounded shadow p-2">
            <div className="text-[10px] text-gray-600 mb-0.5">Cash</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-blue-600">₹{cashPayments}</div>
            <div className="text-[9px] text-gray-500">{cashOrders.length} ord</div>
          </div>
          <div className="bg-white rounded shadow p-2">
            <div className="text-[10px] text-gray-600 mb-0.5">Online</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-purple-600">₹{onlinePayments}</div>
            <div className="text-[9px] text-gray-500">{onlineOrders.length} ord</div>
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="px-2 sm:px-4 mb-2">
        <div className="max-w-md flex gap-2">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="px-3 md:px-4 py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>

      {/* Orders Container */}
      <div className="flex-1 overflow-auto px-2 sm:px-4 pb-2 sm:pb-4 min-h-0">
        {/* Mobile/Tablet Card View */}
        <div className="xl:hidden space-y-3">
          {orders && orders.length > 0 ? orders.map((order) => (
            <div key={order._id || order.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <button
                  onClick={() => handleShowOrderDetails(order)}
                  className="font-semibold text-blue-600 text-sm"
                >
                  #{(order._id || order.id).slice(-8)}
                </button>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {order.status || 'pending'}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {order.orderDateTime ? new Date(order.orderDateTime).toLocaleString() : order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
              </div>
              <div className="text-sm text-gray-700 mb-2">
                <div>{order.items?.length || 0} items</div>
                <div className="text-xs text-gray-500">
                  {order.items?.slice(0, 2).map(item => `${item.qty}x ${item.itemName}`).join(', ')}
                  {order.items?.length > 2 && '...'}
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-600">Payment: {order.paymentMethod || 'Cash'}</div>
                <div className="text-lg font-bold text-gray-900">₹{order.totalAmount || order.totalPrice || 0}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleEditOrder(order)}
                    className="bg-green-100 text-green-600 px-3 py-1 rounded text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handlePrintKOT(order)}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs font-medium"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => handleCancelOrder(order._id || order.id)}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-medium"
                    disabled={order.status === 'cancelled' || order.status === 'completed'}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <svg className="w-12 h-12 text-gray-300 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg font-medium text-gray-500">No orders found</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden xl:block bg-white rounded-lg shadow-lg overflow-hidden w-full">
          <div className="overflow-x-auto scrollbar-visible" style={{scrollbarWidth: 'auto', scrollbarColor: '#cbd5e0 #f7fafc'}}>
          <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
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
                        {order.items?.slice(0, 2).map(item => `${item.qty}x ${item.itemName}`).join(', ')}
                        {order.items?.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                      ₹{order.totalAmount || order.totalPrice || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{order.paymentMethod || 'Cash'}</span>
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
                          onClick={() => handleEditOrder(order)}
                          className="bg-green-100 text-green-600 hover:bg-green-200 px-2 py-1 rounded text-xs font-medium"
                          title="Edit Order"
                        >
                          Edit
                        </button>
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
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
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
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-1 md:space-x-2 py-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 md:px-3 py-1 text-xs md:text-base border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            
            {currentPage > 2 && (
              <button
                onClick={() => setCurrentPage(1)}
                className="px-2 md:px-3 py-1 text-xs md:text-base border rounded hover:bg-gray-100"
              >
                1
              </button>
            )}
            
            {currentPage > 3 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-2 md:px-3 py-1 text-xs md:text-base border rounded hover:bg-gray-100"
              >
                {currentPage - 1}
              </button>
            )}
            
            <button
              className="px-2 md:px-3 py-1 text-xs md:text-base border rounded bg-blue-600 text-white"
            >
              {currentPage}
            </button>
            
            {currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-2 md:px-3 py-1 text-xs md:text-base border rounded hover:bg-gray-100"
              >
                {currentPage + 1}
              </button>
            )}
            
            {currentPage < totalPages - 2 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            
            {currentPage < totalPages - 1 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-2 md:px-3 py-1 text-xs md:text-base border rounded hover:bg-gray-100"
              >
                {totalPages}
              </button>
            )}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 md:px-3 py-1 text-xs md:text-base border rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <p className="text-gray-900">{selectedOrder.paymentMethod || 'Cash'}</p>
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

        {/* Edit Order Modal */}
        {showEditOrder && editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Edit Order</h3>
                <button
                  onClick={() => {
                    setShowEditOrder(false);
                    setEditingOrder(null);
                    setItemSearch('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const totalPrice = editingOrder.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
                  const updatedOrder = {
                    ...editingOrder,
                    totalPrice: totalPrice,
                    totalAmount: totalPrice
                  };
                  const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${editingOrder._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedOrder)
                  });
                  if (response.ok) {
                    await refreshOrders();
                    const allOrdersResponse = await fetch(`${import.meta.env.VITE_API_URL}/orders?limit=10000`);
                    const allOrdersData = await allOrdersResponse.json();
                    setAllOrders(Array.isArray(allOrdersData) ? allOrdersData : allOrdersData.data || []);
                    setShowEditOrder(false);
                  }
                } catch (error) {
                  console.error('Error updating order:', error);
                }
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={editingOrder.customerName || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, customerName: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={editingOrder.status || 'Completed'}
                        onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        value={editingOrder.paymentMethod || 'Cash'}
                        onChange={(e) => setEditingOrder({...editingOrder, paymentMethod: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Online">Online</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Order Items</label>
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [...(editingOrder.items || []), { itemName: '', qty: 1, price: 0 }];
                          setEditingOrder({...editingOrder, items: newItems});
                        }}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        + Add Item
                      </button>
                    </div>
                    {editingOrder.items?.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                        <div className="col-span-5 relative">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => {
                              const newItems = [...editingOrder.items];
                              newItems[index].itemName = e.target.value;
                              setEditingOrder({...editingOrder, items: newItems});
                              setItemSearch(e.target.value);
                            }}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Search item..."
                          />
                          {itemSearch && availableItems.filter(i => 
                            i.itemName?.toLowerCase().includes(itemSearch.toLowerCase())
                          ).length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                              {availableItems
                                .filter(i => i.itemName?.toLowerCase().includes(itemSearch.toLowerCase()))
                                .slice(0, 5)
                                .map((availItem) => (
                                  <div
                                    key={availItem._id}
                                    onClick={() => {
                                      const newItems = [...editingOrder.items];
                                      newItems[index] = {
                                        itemName: availItem.itemName,
                                        qty: newItems[index].qty || 1,
                                        price: availItem.price
                                      };
                                      setEditingOrder({...editingOrder, items: newItems});
                                      setItemSearch('');
                                    }}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                  >
                                    {availItem.itemName} - ₹{availItem.price}
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </div>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => {
                            const newItems = [...editingOrder.items];
                            newItems[index].qty = parseInt(e.target.value);
                            setEditingOrder({...editingOrder, items: newItems});
                          }}
                          className="col-span-2 px-3 py-2 border rounded-lg"
                          placeholder="Qty"
                          min="1"
                        />
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const newItems = [...editingOrder.items];
                            newItems[index].price = parseFloat(e.target.value);
                            setEditingOrder({...editingOrder, items: newItems});
                          }}
                          className="col-span-3 px-3 py-2 border rounded-lg"
                          placeholder="Price"
                          step="0.01"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = editingOrder.items.filter((_, i) => i !== index);
                            setEditingOrder({...editingOrder, items: newItems});
                          }}
                          className="col-span-2 bg-red-100 text-red-600 px-2 py-2 rounded hover:bg-red-200 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditOrder(false);
                        setEditingOrder(null);
                        setItemSearch('');
                      }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}