import { usePosContext } from '../context/PosContext';

export default function CategoryList({ selectedCategory, onCategorySelect }) {
  const { categories } = usePosContext();

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-orange-700 mb-4 pb-3 border-b-2 border-orange-300">MENU CATEGORIES</h2>
      <div className="space-y-2">
        {categories && categories.length > 0 ? (
          categories.map(category => {
            const isSelected = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => onCategorySelect(category)}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors border-2 ${
                  isSelected
                    ? 'bg-green-50 text-green-700 border-green-400'
                    : 'bg-white text-gray-700 border-green-300 hover:border-green-400'
                }`}
              >
                {category.toUpperCase()}
              </button>
            );
          })
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm mb-4">No categories available</div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              Create Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}