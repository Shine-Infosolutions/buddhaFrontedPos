const BASE_URL = import.meta.env.VITE_API_URL;

// Helper function to map _id to id
const mapIdField = (item) => {
  if (item._id) {
    return { ...item, id: item._id };
  }
  return item;
};

// Helper function to map arrays
const mapArrayIds = (array) => {
  return array.map(mapIdField);
};

// Menu & Categories API
export const getAllMenuItems = async () => {
  try {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) throw new Error(`Failed to fetch menu items: ${response.status}`);
    const result = await response.json();
    
    // Extract items from the data array and map fields
    const items = result.data.map(item => ({
      id: item._id,
      name: item.itemName || 'Unnamed Item',
      category: item.categoryName || 'Uncategorized',
      price: item.price || 0,
      available: item.isAvailable !== false
    })).filter(item => item.name !== 'Unnamed Item'); // Filter out items without names
    
    return items;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
};

export const getDistinctCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/categories/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const addCategory = async (categoryName) => {
  try {
    const response = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        categoryName: categoryName,
        itemName: '',
        price: 0,
        qty: 1,
        isAvailable: true
      }),
    });
    if (!response.ok) throw new Error('Failed to add category');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const result = await response.json();
    
    // Extract unique categories
    const categories = [...new Set(
      result.data
        .filter(item => item.categoryName && item.categoryName.trim() !== '')
        .map(item => item.categoryName)
    )];
    
    console.log('Extracted categories:', categories);
    return categories;
  } catch (error) {
    console.error('Error fetching all categories:', error);
    throw error;
  }
};

export const getCategoryIdByName = async (categoryName) => {
  try {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const result = await response.json();
    
    const item = result.data.find(item => item.categoryName === categoryName);
    return item ? item._id : null;
  } catch (error) {
    console.error('Error fetching category ID:', error);
    throw error;
  }
};

export const getItemsByCategory = async (category) => {
  try {
    const response = await fetch(`${BASE_URL}/categories/category/${encodeURIComponent(category)}`);
    if (!response.ok) throw new Error('Failed to fetch items by category');
    const data = await response.json();
    return mapArrayIds(data);
  } catch (error) {
    console.error('Error fetching items by category:', error);
    throw error;
  }
};

export const addMenuItem = async (itemData) => {
  try {
    const response = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categoryName: itemData.categoryName,
        itemName: itemData.itemName,
        price: itemData.price,
        qty: itemData.qty || 1,
        isAvailable: itemData.isAvailable !== false
      }),
    });
    if (!response.ok) throw new Error('Failed to add menu item');
    const data = await response.json();
    return mapIdField(data);
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
};

export const addItemToCategory = async (categoryId, itemData) => {
  try {
    const response = await fetch(`${BASE_URL}/categories/${categoryId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemName: itemData.itemName,
        price: itemData.price,
        qty: itemData.qty || 1,
        isAvailable: itemData.isAvailable !== false
      }),
    });
    if (!response.ok) throw new Error('Failed to add item to category');
    const data = await response.json();
    return mapIdField(data);
  } catch (error) {
    console.error('Error adding item to category:', error);
    throw error;
  }
};

export const updateMenuItem = async (id, itemData) => {
  try {
    const response = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) throw new Error('Failed to update menu item');
    const data = await response.json();
    return mapIdField(data);
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

export const deleteMenuItem = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete menu item');
    return true;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

// Orders API
export const createOrder = async (orderData) => {
  try {
    console.log('Sending order data to /api/orders:', orderData);
    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    console.log('Order API response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Order API error response:', errorText);
      throw new Error('Failed to create order');
    }
    const data = await response.json();
    console.log('Order created successfully:', data);
    return mapIdField(data);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await fetch(`${BASE_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    const result = await response.json();
    console.log('Raw orders API response:', result);
    
    // Handle both direct array and paginated response
    const data = result.data || result;
    return mapArrayIds(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/orders/${id}`);
    if (!response.ok) throw new Error('Failed to fetch order');
    const data = await response.json();
    return mapIdField(data);
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const updateOrder = async (id, orderData) => {
  try {
    const response = await fetch(`${BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) throw new Error('Failed to update order');
    const data = await response.json();
    return mapIdField(data);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete order');
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};