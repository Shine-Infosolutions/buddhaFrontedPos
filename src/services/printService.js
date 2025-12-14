import qz from 'qz-tray';

class PrintService {
  constructor() {
    this.isConnected = false;
    this.printerName = null;
  }

  async connect() {
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('QZ Tray connection failed:', error);
      return false;
    }
  }

  async findPrinters() {
    try {
      await this.connect();
      const printers = await qz.printers.find();
      return printers;
    } catch (error) {
      console.error('Error finding printers:', error);
      return [];
    }
  }

  async setPrinter(printerName) {
    this.printerName = printerName;
  }

  async printKOT(order) {
    try {
      await this.connect();
      
      if (!this.printerName) {
        const printers = await this.findPrinters();
        if (printers.length > 0) {
          this.printerName = printers[0];
        } else {
          throw new Error('No printers found');
        }
      }

      const kotData = this.generateKOTData(order);
      
      const config = qz.configs.create(this.printerName);
      const data = [{
        type: 'raw',
        format: 'plain',
        data: kotData
      }];

      await qz.print(config, data);
      return true;
    } catch (error) {
      console.error('QZ Tray print failed, falling back to browser print:', error);
      this.fallbackBrowserPrint(order);
      return false;
    }
  }

  fallbackBrowserPrint(order) {
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
          </style>
        </head>
        <body>
          <div class="header">
            <div class="restaurant-name">BUDDHA AVENUE</div>
            <div class="title">KOT</div>
            <div class="info">Order #${(order._id || order.id).slice(-8)}</div>
            <div class="info">${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}</div>
          </div>
          <div class="info"><strong>Customer:</strong> ${order.customerName || 'Guest'}</div>
          <div class="info"><strong>Mobile:</strong> ${order.customerMobile || 'N/A'}</div>
          <div class="items">
            <div style="border-bottom: 1px solid #000; margin: 2mm 0;"></div>
            ${order.items?.map(item => `
              <div class="item-row">
                <span>${item.qty}x ${item.itemName}</span>
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
  }

  generateKOTData(order) {
    const ESC = '\x1B';
    const INIT = ESC + '@';
    const CENTER = ESC + 'a1';
    const LEFT = ESC + 'a0';
    const BOLD_ON = ESC + 'E1';
    const BOLD_OFF = ESC + 'E0';
    const CUT = ESC + 'i';
    const NEWLINE = '\n';
    
    let kotText = INIT;
    kotText += CENTER + BOLD_ON + 'BUDDHA AVENUE' + BOLD_OFF + NEWLINE;
    kotText += CENTER + '================================' + NEWLINE;
    kotText += CENTER + BOLD_ON + 'KOT' + BOLD_OFF + NEWLINE;
    kotText += LEFT + 'Order #: ' + (order._id || order.id).slice(-8) + NEWLINE;
    kotText += 'Date: ' + new Date(order.createdAt || Date.now()).toLocaleString('en-IN') + NEWLINE;
    kotText += 'Customer: ' + (order.customerName || 'Guest') + NEWLINE;
    kotText += 'Mobile: ' + (order.customerMobile || 'N/A') + NEWLINE;
    kotText += '================================' + NEWLINE;
    
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        kotText += item.qty + 'x ' + item.itemName.padEnd(20) + ' Rs.' + (item.qty * item.price) + NEWLINE;
      });
    }
    
    kotText += '================================' + NEWLINE;
    kotText += BOLD_ON + 'TOTAL: Rs.' + (order.totalAmount || order.totalPrice || 0) + BOLD_OFF + NEWLINE;
    kotText += 'Status: ' + (order.status || 'pending') + NEWLINE;
    kotText += CENTER + 'Thank You!' + NEWLINE;
    kotText += NEWLINE + NEWLINE + CUT;
    
    return kotText;
  }

  disconnect() {
    if (qz.websocket.isActive()) {
      qz.websocket.disconnect();
    }
    this.isConnected = false;
  }
}

export default new PrintService();