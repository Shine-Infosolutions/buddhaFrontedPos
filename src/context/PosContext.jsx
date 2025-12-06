import { createContext, useContext, useReducer, useEffect } from 'react';

const PosContext = createContext();
const BASE_URL = import.meta.env.VITE_API_URL;

const initialState = {
  categories: [],
  items: [],
  cart: [],
  orders: [],
  customer: { name: '', mobile: '' },
  loading: true
};

function posReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existing = state.cart.find(item => item.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }]
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: []
      };

    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customer: { ...state.customer, ...action.payload }
      };

    case 'PLACE_ORDER':
      const newOrder = {
        id: Date.now(),
        items: [...state.cart],
        customer: { ...state.customer },
        total: state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date(),
        status: 'Completed',
        notes: action.payload.notes || ''
      };
      return {
        ...state,
        orders: [...state.orders, newOrder],
        cart: [],
        customer: { name: '', mobile: '' }
      };

    case 'CANCEL_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload
            ? { ...order, status: 'Cancelled' }
            : order
        )
      };

    case 'SET_MENU_DATA':
      return {
        ...state,
        items: action.payload.items,
        categories: action.payload.categories,
        loading: false
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    default:
      return state;
  }
}

export function PosProvider({ children }) {
  const [state, dispatch] = useReducer(posReducer, initialState);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const [itemsRes, catsRes] = await Promise.all([
          fetch(`${BASE_URL}/items?limit=100`),
          fetch(`${BASE_URL}/categories`)
        ]);
        
        const itemsData = await itemsRes.json();
        const catsData = await catsRes.json();
        
        const allItems = Array.isArray(itemsData) ? itemsData : itemsData.data || [];
        const allCats = Array.isArray(catsData) ? catsData : catsData.data || [];
        
        const catMap = new Map(allCats.map(cat => [cat._id, cat.categoryName]));
        
        const items = allItems.map(item => ({
          id: item._id,
          name: item.itemName,
          category: catMap.get(item.categoryId) || 'Uncategorized',
          price: item.price || 0,
          available: item.isAvailable !== false
        }));
        
        const categories = allCats.map(cat => cat.categoryName);
        
        dispatch({ 
          type: 'SET_MENU_DATA', 
          payload: { items, categories } 
        });
      } catch (error) {
        console.error('Failed to fetch menu data:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchData();
  }, []);

  const addToCart = (item) => dispatch({ type: 'ADD_TO_CART', payload: item });
  const updateQuantity = (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const removeFromCart = (id) => dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const updateCustomer = (data) => dispatch({ type: 'UPDATE_CUSTOMER', payload: data });
  const placeOrder = async (notes) => {
    try {
      const totalAmount = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const payload = {
        items: state.cart.map(item => ({
          itemName: item.name,
          qty: item.quantity,
          price: item.price
        })),
        totalAmount: totalAmount,
        totalPrice: totalAmount,
        status: 'Completed'
      };

      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error('Failed to create order');
      
      dispatch({ type: 'PLACE_ORDER', payload: { notes } });
      return { success: true, message: 'Order placed successfully!' };
    } catch (error) {
      console.error('Failed to place order:', error);
      return { success: false, message: 'Failed to place order. Please try again.' };
    }
  };
  const cancelOrder = (id) => dispatch({ type: 'CANCEL_ORDER', payload: id });
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${BASE_URL}/orders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return [];
    }
  };
  
  const fetchOrderById = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/orders/${id}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw error;
    }
  };
  
  const updateOrderById = async (id, orderData) => {
    try {
      const response = await fetch(`${BASE_URL}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error('Failed to update order');
      return await response.json();
    } catch (error) {
      console.error('Failed to update order:', error);
      throw error;
    }
  };
  
  const deleteOrderById = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/orders/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete order');
      return true;
    } catch (error) {
      console.error('Failed to delete order:', error);
      throw error;
    }
  };

  const addItem = async (itemData) => {
    try {
      const response = await fetch(`${BASE_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (!response.ok) throw new Error('Failed to add item');
      
      // Refresh data
      const [itemsRes, catsRes] = await Promise.all([
        fetch(`${BASE_URL}/items?limit=100`),
        fetch(`${BASE_URL}/categories`)
      ]);
      
      const itemsData = await itemsRes.json();
      const catsData = await catsRes.json();
      const allItems = Array.isArray(itemsData) ? itemsData : itemsData.data || [];
      const allCats = Array.isArray(catsData) ? catsData : catsData.data || [];
      const catMap = new Map(allCats.map(cat => [cat._id, cat.categoryName]));
      
      const items = allItems.map(item => ({
        id: item._id,
        name: item.itemName,
        category: catMap.get(item.categoryId) || 'Uncategorized',
        price: item.price || 0,
        available: item.isAvailable !== false
      }));
      
      const categories = allCats.map(cat => cat.categoryName);
      
      dispatch({ type: 'SET_MENU_DATA', payload: { items, categories } });
      return { success: true };
    } catch (error) {
      console.error('Failed to add item:', error);
      return { success: false, error: error.message };
    }
  };
  
  const updateItem = async (id, itemData) => {
    try {
      const response = await fetch(`${BASE_URL}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (!response.ok) throw new Error('Failed to update item');
      
      // Refresh data (same as addItem)
      const [itemsRes, catsRes] = await Promise.all([
        fetch(`${BASE_URL}/items?limit=100`),
        fetch(`${BASE_URL}/categories`)
      ]);
      
      const itemsData = await itemsRes.json();
      const catsData = await catsRes.json();
      const allItems = Array.isArray(itemsData) ? itemsData : itemsData.data || [];
      const allCats = Array.isArray(catsData) ? catsData : catsData.data || [];
      const catMap = new Map(allCats.map(cat => [cat._id, cat.categoryName]));
      
      const items = allItems.map(item => ({
        id: item._id,
        name: item.itemName,
        category: catMap.get(item.categoryId) || 'Uncategorized',
        price: item.price || 0,
        available: item.isAvailable !== false
      }));
      
      const categories = allCats.map(cat => cat.categoryName);
      
      dispatch({ type: 'SET_MENU_DATA', payload: { items, categories } });
      return { success: true };
    } catch (error) {
      console.error('Failed to update item:', error);
      return { success: false, error: error.message };
    }
  };
  
  const deleteItem = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/items/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete item');
      
      // Refresh data (same as addItem)
      const [itemsRes, catsRes] = await Promise.all([
        fetch(`${BASE_URL}/items?limit=100`),
        fetch(`${BASE_URL}/categories`)
      ]);
      
      const itemsData = await itemsRes.json();
      const catsData = await catsRes.json();
      const allItems = Array.isArray(itemsData) ? itemsData : itemsData.data || [];
      const allCats = Array.isArray(catsData) ? catsData : catsData.data || [];
      const catMap = new Map(allCats.map(cat => [cat._id, cat.categoryName]));
      
      const items = allItems.map(item => ({
        id: item._id,
        name: item.itemName,
        category: catMap.get(item.categoryId) || 'Uncategorized',
        price: item.price || 0,
        available: item.isAvailable !== false
      }));
      
      const categories = allCats.map(cat => cat.categoryName);
      
      dispatch({ type: 'SET_MENU_DATA', payload: { items, categories } });
      return { success: true };
    } catch (error) {
      console.error('Failed to delete item:', error);
      return { success: false, error: error.message };
    }
  };
  
  const addCategory = async (categoryName) => {
    try {
      const response = await fetch(`${BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName }),
      });
      if (!response.ok) throw new Error('Failed to add category');
      
      // Refresh data (same as addItem)
      const [itemsRes, catsRes] = await Promise.all([
        fetch(`${BASE_URL}/items?limit=100`),
        fetch(`${BASE_URL}/categories`)
      ]);
      
      const itemsData = await itemsRes.json();
      const catsData = await catsRes.json();
      const allItems = Array.isArray(itemsData) ? itemsData : itemsData.data || [];
      const allCats = Array.isArray(catsData) ? catsData : catsData.data || [];
      const catMap = new Map(allCats.map(cat => [cat._id, cat.categoryName]));
      
      const items = allItems.map(item => ({
        id: item._id,
        name: item.itemName,
        category: catMap.get(item.categoryId) || 'Uncategorized',
        price: item.price || 0,
        available: item.isAvailable !== false
      }));
      
      const categories = allCats.map(cat => cat.categoryName);
      
      dispatch({ type: 'SET_MENU_DATA', payload: { items, categories } });
      return { success: true };
    } catch (error) {
      console.error('Failed to add category:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <PosContext.Provider value={{
      ...state,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      updateCustomer,
      placeOrder,
      cancelOrder,
      addItem,
      updateItem,
      deleteItem,
      addCategory,
      fetchOrders,
      fetchOrderById,
      updateOrderById,
      deleteOrderById
    }}>
      {children}
    </PosContext.Provider>
  );
}

export const usePosContext = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePosContext must be used within a PosProvider');
  }
  return context;
};