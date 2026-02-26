
const PaymentLogSidebar = () => (
  <aside className="w-64 bg-gray-100 h-full p-4 border-r">
    <h2 className="text-lg font-bold mb-4">Payment Log Sidebar</h2>
    <ul>
      <li className="mb-2"><a href="/admin/payment-logs" className="text-blue-600 hover:underline">Payment Logs</a></li>
      {/* Add more sidebar links as needed */}
    </ul>
  </aside>
);

export default PaymentLogSidebar;
