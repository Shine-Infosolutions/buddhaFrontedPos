import qz from 'qz-tray';

class QZTrayService {
  constructor() {
    this.isConnected = false;
    this.defaultPrinter = null;
  }

  async connect() {
    if (this.isConnected || qz.websocket.isActive()) return true;

    try {
      qz.security.setCertificatePromise(function(resolve, reject) {
        resolve();
      });
      
      qz.security.setSignaturePromise(function(toSign, resolve, reject) {
        resolve();
      });

      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }
      this.isConnected = true;
      return true;
    } catch (error) {
      if (error.message.includes('already exists')) {
        this.isConnected = true;
        return true;
      }
      console.log('QZ Tray not available, using mock mode');
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
          console.log('Mock print (no QZ Tray):', receiptData);
          return true;
        }
      }

      const printers = await this.getPrinters();
      if (printers.length === 0) {
        console.log('Mock print (no printers):', receiptData);
        return true;
      }

      const printer = printerName || this.defaultPrinter || printers[0];
      const config = qz.configs.create(printer);
      const data = this.formatReceiptData(receiptData);
      
      await qz.print(config, data);
      return true;
    } catch (error) {
      console.log('Mock print (error):', receiptData);
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
      `\n${storeName}\n`,
      '================================\n',
      `Order #: ${orderNumber}\n`,
      `Date: ${timestamp}\n`,
      '--------------------------------\n',
      ...items.map(item => `${item.name.padEnd(20)} ${item.quantity}x $${item.price.toFixed(2)}\n`),
      '--------------------------------\n',
      `Subtotal: $${(total - tax).toFixed(2)}\n`,
      `Tax: $${tax.toFixed(2)}\n`,
      `Total: $${total.toFixed(2)}\n`,
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