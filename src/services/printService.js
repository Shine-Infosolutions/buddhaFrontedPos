import qzTrayService from '../utils/qzTrayService';

class PrintService {
  async printKOT(orderData) {
    try {
      const receiptData = {
        storeName: 'Buddha POS',
        orderNumber: (orderData._id || orderData.id || '').slice(-8),
        items: orderData.items || [],
        total: orderData.totalAmount || orderData.totalPrice || 0,
        tax: 0,
        timestamp: new Date(orderData.createdAt || Date.now()).toLocaleString()
      };

      await qzTrayService.printReceipt(receiptData);
      return true;
    } catch (error) {
      console.error('Print service error:', error);
      return false;
    }
  }
}

export default new PrintService();