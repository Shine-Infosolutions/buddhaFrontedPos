import OrderList from '../components/OrderList';

export default function AllOrders() {
  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-800">All Orders</h1>
      </div>

      {/* Orders Table */}
      <OrderList />
    </div>
  );
}