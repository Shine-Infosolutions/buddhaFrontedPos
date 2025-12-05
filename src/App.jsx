import { useState } from 'react';
import { PosProvider } from './context/PosContext';
import POS from './pages/POS';
import AllOrders from './pages/AllOrders';

function App() {
  const [currentPage, setCurrentPage] = useState('pos');

  const renderPage = () => {
    switch (currentPage) {
      case 'pos':
        return <POS />;
      case 'orders':
        return <AllOrders />;
      default:
        return <POS />;
    }
  };

  return (
    <PosProvider>
      {renderPage()}
    </PosProvider>
  );
}

export default App;