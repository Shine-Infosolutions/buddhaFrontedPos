import { usePosContext } from '../context/PosContext';

export default function MenuItems({ selectedCategory }) {
  const { items, addToCart } = usePosContext();

  // Filter items by selected category
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-4">
                <h4 className="font-semibold text-gray-800 text-lg mb-2">{item.name}</h4>
                <p className="text-2xl font-bold text-yellow-600">₹{item.price}</p>
              </div>
              <button
                onClick={() => addToCart(item)}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                ADD TO ORDER
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No items found in this category</div>
        </div>
      )}
    </div>
  );
}