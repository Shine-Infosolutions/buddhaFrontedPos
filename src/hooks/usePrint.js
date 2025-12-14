import { useState, useCallback } from 'react';
import qzTrayService from '../utils/qzTrayService';

export const usePrint = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');

  const connectToQZ = useCallback(async () => {
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
      return connected;
    } catch (error) {
      console.error('QZ connection failed:', error);
      return false;
    }
  }, []);

  const printReceipt = useCallback(async (receiptData, printer = null) => {
    try {
      if (!isConnected) {
        const connected = await connectToQZ();
        if (!connected) throw new Error('Failed to connect to QZ Tray');
      }

      await qzTrayService.printReceipt(receiptData, printer || selectedPrinter);
      return true;
    } catch (error) {
      console.error('Print failed:', error);
      throw error;
    }
  }, [isConnected, selectedPrinter, connectToQZ]);

  return {
    isConnected,
    printers,
    selectedPrinter,
    setSelectedPrinter,
    connectToQZ,
    printReceipt
  };
};