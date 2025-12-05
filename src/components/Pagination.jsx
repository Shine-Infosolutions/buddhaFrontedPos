export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage 
}) {
  if (totalItems === 0) return null;
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Showing {startItem} to {endItem} of {totalItems} orders
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded disabled:opacity-50 hover:bg-gray-200"
        >
          Previous
        </button>
        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded">
          {currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded disabled:opacity-50 hover:bg-gray-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}