export default function AlertBox({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Action</h3>
        <p className="text-gray-600 mb-8 text-lg">{message}</p>
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-bold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 font-bold transition-all shadow-lg"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}