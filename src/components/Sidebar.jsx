import { useState } from 'react';
import { usePosContext } from '../context/PosContext';
import logoImg from '../assets/buddha-logo.png';

export default function Sidebar({ currentPage, onPageChange, selectedCategory, onCategorySelect, isMobile, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { categories: dynamicCategories } = usePosContext();

  const categories = [
    ...dynamicCategories.map(cat => ({ id: cat, label: cat }))
  ];

  const handleCategoryClick = (categoryId) => {
    onCategorySelect(categoryId);
    onPageChange('pos'); // Switch back to menu view
    if (isMobile && onClose) onClose();
    setIsOpen(false);
  };

  const handleMenuCategoriesClick = () => {
    onCategorySelect('all');
    onPageChange('pos'); // Switch back to menu view
    if (isMobile && onClose) onClose();
    setIsOpen(false);
  };

  return (
    <>


      {/* Sidebar */}
      <div className="w-64 flex flex-col h-full justify-between bg-gray-900 text-white border-r border-gray-700">
        {/* Top Section - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="py-8 border-b border-gray-700">
            <div className="flex flex-col items-center justify-center relative">
              {isMobile && (
                <button
                  onClick={onClose}
                  className="absolute top-0 right-4 text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <img src={logoImg} alt="Buddha Logo" className="h-16 w-auto drop-shadow-sm mb-3" />
              <h1 className="text-white font-bold tracking-[0.2em] uppercase text-sm">BUDDHA AVENUE</h1>
            </div>
          </div>
          
          <nav className="p-6 space-y-6">
            {/* All Orders Button */}
            <button
              onClick={() => {
                onPageChange('orders');
                if (isMobile && onClose) onClose();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-medium transition-all ${
                currentPage === 'orders'
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>All Orders</span>
            </button>
            
            {/* Categories Dropdown */}
            <div>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left font-medium transition-all text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <span>Categories</span>
                </div>
                <svg className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isCategoriesOpen && (
                <div className="mt-2 ml-4 space-y-1">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`w-full px-4 py-2 rounded-lg text-left font-medium transition-all ${
                        selectedCategory === category.id
                          ? 'text-white bg-gray-800 border-l-4 border-yellow-600'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom Section - Logout */}
        <div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                window.location.reload();
              }
            }}
            className="flex items-center gap-3 w-full p-4 hover:bg-gray-800 transition-colors border-t border-gray-800"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-gray-400 font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}