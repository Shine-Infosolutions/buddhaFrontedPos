import qz from 'qz-tray';

class QZTrayService {
  constructor() {
    this.isConnected = false;
    this.defaultPrinter = null;
  }

  async connect() {
    if (this.isConnected) return true;

    try {
      if (typeof qz === 'undefined' || !qz.websocket) {
        console.log('QZ Tray not available, using mock mode');
        return false;
      }

      if (qz.websocket.isActive()) {
        this.isConnected = true;
        return true;
      }

      // Disable security for localhost development
      qz.security.setCertificatePromise(function(resolve) {
        resolve();
      });
      
      qz.security.setSignaturePromise(function(toSign) {
        return function(resolve) {
          resolve();
        };
      });

      await qz.websocket.connect();
      this.isConnected = true;
      return true;
    } catch (error) {
      console.log('QZ Tray connection error:', error.message);
      return false;
    }
  }

  async getPrinters() {
    if (!this.isConnected) await this.connect();
    return await qz.printers.find();
  }

  setDefaultPrinter(printerName) {
    this.defaultPrinter = printerName;
  }

  async printReceipt(receiptData, printerName = null) {
    try {
      if (!this.isConnected) {
        const connected = await this.connect();
        if (!connected) {
          console.log('Mock print KOT #1:', receiptData);
          console.log('Mock print KOT #2:', receiptData);
          return true;
        }
      }

      const printers = await this.getPrinters();
      if (printers.length === 0) {
        console.log('Mock print KOT #1 (no printers):', receiptData);
        console.log('Mock print KOT #2 (no printers):', receiptData);
        return true;
      }

      const printer = printerName || this.defaultPrinter || printers[0];
      const config = qz.configs.create(printer);
      const data = this.formatReceiptData(receiptData);
      
      // Print two KOTs simultaneously
      await Promise.all([
        qz.print(config, data),
        qz.print(config, data)
      ]);
      
      return true;
    } catch (error) {
      console.log('Mock print KOT #1 (error):', receiptData);
      console.log('Mock print KOT #2 (error):', receiptData);
      return true;
    }
  }

  formatReceiptData(receiptData) {
    const { 
      storeName = 'Buddha POS',
      items = [],
      total = 0,
      tax = 0,
      orderNumber = '',
      timestamp = new Date().toLocaleString()
    } = receiptData;

    return [
      { type: 'image', data: '/buddha-logo.png', options: { align: 'center' } },
      `\n${storeName}\n`,
      '================================\n',
      `Order #: ${orderNumber}\n`,
      `Date: ${timestamp}\n`,
      '--------------------------------\n',
      ...items.map(item => `${(item.itemName || item.name).padEnd(20)} ${item.qty || item.quantity}x ₹${item.price.toFixed(2)}\n`),
      '--------------------------------\n',
      `Subtotal: ₹${(total - tax).toFixed(2)}\n`,
      `Tax: ₹${tax.toFixed(2)}\n`,
      `Total: ₹${total.toFixed(2)}\n`,
      '================================\n',
      'Thank you!\n\n\n'
    ];
  }

  async disconnect() {
    if (this.isConnected) {
      await qz.websocket.disconnect();
      this.isConnected = false;
    }
  }
}

export default new QZTrayService();