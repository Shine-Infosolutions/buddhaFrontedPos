import { createContext, useContext, useReducer, useEffect } from 'react';
import { getAllMenuItems, getAllCategories, createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder, addCategory as apiAddCategory, addMenuItem, updateMenuItem, deleteMenuItem } from '../services/api';

const PosContext = createContext();

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

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        console.log('Fetching menu data...');
        
        const menuItems = await getAllMenuItems();
        console.log('Menu items received:', menuItems);
        
        const categoriesData = await getAllCategories();
        console.log('Categories received:', categoriesData);
        
        // Categories data is already an array of strings
        console.log('Processed categories:', categoriesData);
        
        dispatch({ 
          type: 'SET_MENU_DATA', 
          payload: { 
            items: menuItems, 
            categories: categoriesData 
          } 
        });
        console.log('Data set successfully');
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
      const payload = {
        customerName: state.customer.name || 'Guest',
        mobileNumber: state.customer.mobile || '',
        items: state.cart,
        totalAmount: state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentMethod: 'cash',
        status: 'pending'
      };

      await createOrder(payload);
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
      const orders = await getAllOrders();
      return orders;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return [];
    }
  };
  const fetchOrderById = async (id) => {
    try {
      return await getOrderById(id);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw error;
    }
  };
  const updateOrderById = async (id, orderData) => {
    try {
      return await updateOrder(id, orderData);
    } catch (error) {
      console.error('Failed to update order:', error);
      throw error;
    }
  };
  const deleteOrderById = async (id) => {
    try {
      return await deleteOrder(id);
    } catch (error) {
      console.error('Failed to delete order:', error);
      throw error;
    }
  };

  const addItem = async (itemData) => {
    try {
      await addMenuItem({
        categoryName: itemData.category,
        itemName: itemData.name,
        price: itemData.price,
        qty: itemData.qty || 1,
        isAvailable: itemData.available !== false
      });
      
      // Refresh data
      const [menuItems, categoriesData] = await Promise.all([
        getAllMenuItems(),
        getAllCategories()
      ]);
      dispatch({ 
        type: 'SET_MENU_DATA', 
        payload: { 
          items: menuItems, 
          categories: categoriesData 
        } 
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to add item:', error);
      return { success: false, error: error.message };
    }
  };
  const updateItem = async (id, itemData) => {
    try {
      await updateMenuItem(id, {
        categoryName: itemData.category,
        itemName: itemData.name,
        price: itemData.price,
        qty: itemData.qty || 1,
        isAvailable: itemData.available !== false
      });
      
      // Refresh data
      const [menuItems, categoriesData] = await Promise.all([
        getAllMenuItems(),
        getAllCategories()
      ]);
      dispatch({ 
        type: 'SET_MENU_DATA', 
        payload: { 
          items: menuItems, 
          categories: categoriesData 
        } 
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to update item:', error);
      return { success: false, error: error.message };
    }
  };
  
  const deleteItem = async (id) => {
    try {
      await deleteMenuItem(id);
      
      // Refresh data
      const [menuItems, categoriesData] = await Promise.all([
        getAllMenuItems(),
        getAllCategories()
      ]);
      dispatch({ 
        type: 'SET_MENU_DATA', 
        payload: { 
          items: menuItems, 
          categories: categoriesData 
        } 
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to delete item:', error);
      return { success: false, error: error.message };
    }
  };
  const addCategory = async (categoryName) => {
    try {
      await apiAddCategory(categoryName);
      // Refresh the data after adding category
      const [menuItems, categoriesData] = await Promise.all([
        getAllMenuItems(),
        getAllCategories()
      ]);
      dispatch({ 
        type: 'SET_MENU_DATA', 
        payload: { 
          items: menuItems, 
          categories: categoriesData 
        } 
      });
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