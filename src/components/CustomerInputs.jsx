import { usePosContext } from '../context/PosContext';

export default function CustomerInputs() {
  const { customer, updateCustomer } = usePosContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <input
          type="text"
          value={customer.name}
          onChange={(e) => updateCustomer({ name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white text-gray-800 font-medium shadow-sm"
          placeholder="Customer Name"
        />
      </div>
      <div>
        <input
          type="tel"
          value={customer.mobile}
          onChange={(e) => updateCustomer({ mobile: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white text-gray-800 font-medium shadow-sm"
          placeholder="Mobile Number"
        />
      </div>
    </div>
  );
}