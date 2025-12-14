import { useState, useEffect } from 'react';
import qzTrayService from '../utils/qzTrayService';

const PrintButton = ({ receiptData, className = '' }) => {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    initializeQZ();
  }, []);

  const initializeQZ = async () => {
    try {
      const connected = await qzTrayService.connect();
      setIsConnected(connected);
      
      if (connected) {
        const availablePrinters = await qzTrayService.getPrinters();
        setPrinters(availablePrinters);
        if (availablePrinters.length > 0) {
          setSelectedPrinter(availablePrinters[0]);
          qzTrayService.setDefaultPrinter(availablePrinters[0]);
        }
      }
    } catch (error) {
      console.error('QZ initialization failed:', error);
    }
  };

  const handlePrint = async () => {
    if (!receiptData || !selectedPrinter) return;

    setIsPrinting(true);
    try {
      await qzTrayService.printReceipt(receiptData, selectedPrinter);
      alert('Receipt printed successfully!');
    } catch (error) {
      alert('Print failed: ' + error.message);
    } finally {
      setIsPrinting(false);
    }
  };

  if (!isConnected) {
    return (
      <button 
        onClick={initializeQZ}
        className={`bg-red-500 text-white px-4 py-2 rounded ${className}`}
      >
        Connect to QZ Tray
      </button>
    );
  }

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <select 
        value={selectedPrinter} 
        onChange={(e) => setSelectedPrinter(e.target.value)}
        className="border rounded px-2 py-1"
      >
        {printers.map(printer => (
          <option key={printer} value={printer}>{printer}</option>
        ))}
      </select>
      <button 
        onClick={handlePrint}
        disabled={isPrinting || !selectedPrinter}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isPrinting ? 'Printing...' : 'Print Receipt'}
      </button>
    </div>
  );
};

export default PrintButton;