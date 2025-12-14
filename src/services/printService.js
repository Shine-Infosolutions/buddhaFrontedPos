import qz from 'qz-tray';

class PrintService {
  constructor() {
    this.isConnected = false;
    this.printerName = null;
  }

  async connect() {
    try {
      if (!qz.websocket.isActive()) {
        // Set certificate to avoid anonymous requests
        qz.security.setCertificatePromise(function(resolve, reject) {
          const certificate = `-----BEGIN CERTIFICATE-----
MIIECzCCAvOgAwIBAgIGAZsclEMTMA0GCSqGSIb3DQEBCwUAMIGiMQswCQYDVQQG
EwJVUzELMAkGA1UECAwCTlkxEjAQBgNVBAcMCUNhbmFzdG90YTEbMBkGA1UECgwS
UVogSW5kdXN0cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMx
HDAaBgkqhkiG9w0BCQEWDXN1cHBvcnRAcXouaW8xGjAYBgNVBAMMEVFaIFRyYXkg
RGVtbyBDZXJ0MB4XDTI1MTIxMzExMTcxN1oXDTQ1MTIxMzExMTcxN1owgaIxCzAJ
BgNVBAYTAlVTMQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYD
VQQKDBJRWiBJbmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMs
IExMQzEcMBoGCSqGSIb3DQEJARYNc3VwcG9ydEBxei5pbzEaMBgGA1UEAwwRUVog
VHJheSBEZW1vIENlcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC4
BMyblxudDAHWHDeMTiBAfItttXYBk7DqmKGF/DzVkOKkZHYZoZ3cD2GIE8ykdBzQ
zMNha7oDvj3LPvHH2rewRjdBcE4Iyx+w5FhfcrgnGwvZ1wAU143fVSCsTyoXiS+e
KpOKepf7JmFY2ztWOW0ZFMBOGD7bCM2UMWI0MbNTsT5gV4IfIlwsEA9l7NQJ/ELu
BjsxS0omER3yRN9FUNvf+HRlD+iqP1714DexkFkPWpvQNE0GtD30h22O/hg+/BB4
VESkyhnC6IHGF7yglD0ApXgWZ885D2bNGIVqG2xQbl/TDNYMZ4wW3pyz/zQS0HUN
rrXKpIAe6vdFqVdYvSILAgMBAAGjRTBDMBIGA1UdEwEB/wQIMAYBAf8CAQEwDgYD
VR0PAQH/BAQDAgEGMB0GA1UdDgQWBBQkb7FqNI/3OUWKbDSEAUt9Cq96ezANBgkq
hkiG9w0BAQsFAAOCAQEAZQ4R5PPvX7hpzjFYLBfX9IkcV3P1bg9YV07nMELoMbOR
8RXSpni0bf4fdHtxOYbVsYSd8/pK6k1ajhfGQgsj1aFQ1Lec4Hx2XHhTwBgi3M9r
Qh13bN5sX8mhdtaNaH6Q9hGY/6n3ZvRErH2sqcVX42Eyr8usjDBhM2e62KZLUUWY
UFkFI4a4viE0y0TM52o44vX419rhhABdFTubY5D3d5gKN/J1a0vWqGlefCi+lotc
njrpliA5iGpjKeBUs+LrXYTm/qxfty3Lv6PWdfAxiGOxnY0lJWOXeXV9Sg5KFRtZ
4gAGgwBcsi3fkem8EXkxx1qLcjuQTz3ygl017xoxSw==
-----END CERTIFICATE-----`;
          resolve(certificate);
        });

        qz.security.setSignatureAlgorithm('SHA512');
        qz.security.setSignaturePromise(function(toSign) {
          return function(resolve, reject) {
            // Use external signing service or return empty signature
            resolve('');
          };
        });

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

      // Print first copy
      await qz.print(config, data);
      // Print second copy
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
              setTimeout(function() { 
                window.print();
                setTimeout(function() { window.print(); }, 1000);
              }, 250);
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