import { useState } from 'react';
import Sidebar from './Sidebar';
import CustomerInputs from './CustomerInputs';
import MenuItems from './MenuItems';
import CartSidebar from './CartSidebar';
import OrderList from './OrderList';
import MenuManagement from './MenuManagement';
import CategoryItemsView from './CategoryItemsView';
import logoImg from '../assets/buddha-logo.png';
import { usePosContext } from '../context/PosContext';

export default function ResponsivePOSLayout() {
  const [selectedCategory, setSelectedCategory] = useState('BEVERAGES');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('pos');
  const { cart, loading } = usePosContext();
  
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const renderMainContent = () => {
    if (currentPage === 'orders') {
      return <OrderList onOpenCart={() => setIsCartOpen(true)} />;
    }
    if (currentPage === 'menu-management') {
      return <MenuManagement onBack={setCurrentPage} />;
    }
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu...</p>
          </div>
        </div>
      );
    }
    
    // Show CategoryItemsView when a category is selected
    if (selectedCategory && selectedCategory !== 'all') {
      return <CategoryItemsView selectedCategory={selectedCategory} />;
    }
    
    return (
      <>
        {/* Customer Inputs */}
        <div className="p-6">
          <CustomerInputs />
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 px-6 pb-6 overflow-y-auto">
          <MenuItems selectedCategory={selectedCategory} />
        </div>
      </>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar - Navigation (Desktop) */}
      <div className="hidden lg:block">
        <Sidebar 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>

      {/* Left Sidebar - Navigation (Mobile) */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            setIsSidebarOpen(false);
          }}
          selectedCategory={selectedCategory}
          onCategorySelect={(category) => {
            setSelectedCategory(category);
            setIsSidebarOpen(false);
          }}
          isMobile={true}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Center Area - Main Content */}
      <div className="flex-1 flex flex-col lg:border-r lg:border-gray-200 pt-16 lg:pt-0">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-16 bg-gray-900 flex items-center justify-between px-4 shadow-xl">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-yellow-600 active:scale-95 transition-transform duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Buddha Logo" className="h-7 w-auto drop-shadow-sm" />
            <h1 className="text-sm font-bold tracking-widest uppercase text-white">BUDDHA AVENUE</h1>
          </div>
        </div>



        {renderMainContent()}
      </div>

      {/* Right Sidebar - Cart (Desktop Static - Menu View Only) */}
      {currentPage === 'pos' && (
        <div className="hidden lg:block w-96 bg-white border-l border-gray-200">
          <CartSidebar 
            isOpen={true} 
            onClose={() => {}} 
            isDesktop={true}
            onNavigateToOrders={() => setCurrentPage('orders')}
          />
        </div>
      )}

      {/* Cart Drawer (Mobile) */}
      <div className="lg:hidden">
        <CartSidebar 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          isDesktop={false}
          onNavigateToOrders={() => setCurrentPage('orders')}
        />
      </div>

      {/* Floating Cart Button (Mobile) */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 h-14 w-14 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-all duration-200"
      >
        <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce">
            {itemCount}
          </span>
        )}
      </button>
    </div>
  );
}