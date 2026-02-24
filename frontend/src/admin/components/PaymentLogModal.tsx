import React from 'react';

interface PaymentLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentLog: any;
}

const PaymentLogModal: React.FC<PaymentLogModalProps> = ({ isOpen, onClose, paymentLog }) => {
  if (!isOpen || !paymentLog) return null;

  const u: any = typeof paymentLog.user === 'string' ? { _id: paymentLog.user } : (paymentLog.user || {});
  const ev: any = typeof paymentLog.event === 'string' ? { _id: paymentLog.event } : (paymentLog.event || {});
  const ticketsCount = Array.isArray(paymentLog.tickets) ? paymentLog.tickets.length : 0;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Log Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{paymentLog.transactionId || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    paymentLog.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                    paymentLog.status === 'failed' ? 'bg-red-100 text-red-700' :
                    paymentLog.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {paymentLog.status || 'Unknown'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">₹{(paymentLog.amount ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">IND</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tickets Sold</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{ticketsCount}</p>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">User Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Name</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{u?.name || 'Unknown User'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{u?._id || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Email</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{u?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Event Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Event Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Title</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{ev?.title || 'Unknown Event'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event ID</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{ev?._id || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Timestamps</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {new Date(paymentLog.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Updated At</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {new Date(paymentLog.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          {paymentLog.tickets && paymentLog.tickets.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Ticket Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentLog.tickets.map((ticket: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{ticket._id || `TICKET-${index + 1}`}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{ticket.type || 'Standard'}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">${ticket.price || '0.00'}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{ticket.status || 'Active'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw Data */}
          
        </div>
      </div>
    </div>
  );
};

export default PaymentLogModal;
