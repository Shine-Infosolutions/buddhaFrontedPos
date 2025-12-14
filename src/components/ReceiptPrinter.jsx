import { usePrint } from '../hooks/usePrint';

const ReceiptPrinter = ({ orderData }) => {
  const { isConnected, printers, selectedPrinter, setSelectedPrinter, connectToQZ, printReceipt } = usePrint();

  const handlePrintOrder = async () => {
    const receiptData = {
      storeName: 'Buddha POS',
      orderNumber: orderData.id || 'N/A',
      items: orderData.items || [],
      total: orderData.total || 0,
      tax: orderData.tax || 0,
      timestamp: new Date().toLocaleString()
    };

    try {
      await printReceipt(receiptData);
      console.log('Order printed successfully');
    } catch (error) {
      alert('Print failed: ' + error.message);
    }
  };

  if (!isConnected) {
    return (
      <button 
        onClick={connectToQZ}
        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
      >
        Connect Printer
      </button>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <select 
        value={selectedPrinter} 
        onChange={(e) => setSelectedPrinter(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        {printers.map(printer => (
          <option key={printer} value={printer}>{printer}</option>
        ))}
      </select>
      <button 
        onClick={handlePrintOrder}
        disabled={!selectedPrinter}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
      >
        Print Receipt
      </button>
    </div>
  );
};

export default ReceiptPrinter;