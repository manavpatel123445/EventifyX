import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminPaymentLogs, type PaymentLogsParams, type PaymentLogsResponse } from '../../services/paymentService';
import SideBar from '../components/SideBar';
import PaymentLogModal from '../components/PaymentLogModal';

const AdminPaymentLogsPage = () => {
  // Payment Logs Table State
  const [paymentLogsPage, setPaymentLogsPage] = useState<number>(1);
  const [paymentLogsLimit, setPaymentLogsLimit] = useState<number>(10);

  // Revenue & Sales Table State
  const [revenuePage, setRevenuePage] = useState<number>(1);

  const [eventId] = useState<string>("");
  const [userId] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [searchType, setSearchType] = useState<string>('userName');
  const [selectedPaymentLog, setSelectedPaymentLog] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Payment Logs Table Query Parameters
  const paymentLogsParams: PaymentLogsParams = useMemo(() => ({
    page: paymentLogsPage,
    limit: paymentLogsLimit,
    eventId,
    userId,
    transactionId,
    userName,
    eventName,
    status,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }), [paymentLogsPage, paymentLogsLimit, eventId, userId, transactionId, userName, eventName, status]);

 

  const queryClient = useQueryClient();

  const {
    data: paymentLogsResponse,
    isLoading: _loading,
    error: _error,
    refetch
  } = useQuery<PaymentLogsResponse>({
    queryKey: ['paymentLogs', paymentLogsParams] as const,
    queryFn: () => getAdminPaymentLogs(paymentLogsParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const logs = paymentLogsResponse?.data || [];
  const paymentLogsTotalPages = paymentLogsResponse?.pagination?.totalPages || 1;

  // Handle search
  const handleSearch = () => {
    console.log('Search triggered with:', {
      searchType,
      search,
      transactionId,
      userName,
      eventName
    });
    setPaymentLogsPage(1); // Reset payment logs to first page when searching
    setRevenuePage(1); // Reset revenue to first page when searching
    queryClient.invalidateQueries({ queryKey: ['paymentLogs'] });
    refetch();
  };

  // Handle filters
  const handleFilterChange = () => {
    setPaymentLogsPage(1); // Reset payment logs to first page when filtering
    setRevenuePage(1); // Reset revenue to first page when filtering
    queryClient.invalidateQueries({ queryKey: ['paymentLogs'] });
    refetch();
  };

  if (_error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="text-red-500 text-lg">Error loading payment logs</div>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
   
    <div className="flex min-h-screen">
   
      <SideBar />
      <div className="flex-1 p-6 space-y-8 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Payment Logs</h1>
          <button
            onClick={() => {
              const headers = ["Date","Transaction ID","User Name","Event Name","Amount","Currency","Status","Payment Method","Sold Tickets"];
              const rows = logs.map((l) => [
                new Date(l.createdAt).toISOString(),
                l.transactionId || "",
                typeof l.user === 'string' ? '' : (l.user?.name || ''),
                typeof l.event === 'string' ? '' : (l.event?.title || ''),
                String(l.amount ?? 0),
                l.currency || '',
                l.status || '',
                (l as any).provider || '',
                Array.isArray(l.tickets) ? String(l.tickets.length) : '0'
              ]);
              const csv = [headers, ...rows].map(r => r.map((v: any) => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `payment_logs_page_${paymentLogsPage}.csv`;
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-gray-50"
          >
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-md border mb-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            
            <select className="border rounded px-3 py-2 w-full md:w-auto" value={status} onChange={(e) => { setPaymentLogsPage(1); setStatus(e.target.value); handleFilterChange(); }}>
              <option value="">All Statuses</option>
              <option value="succeeded">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select className="border rounded px-3 py-2 w-full md:w-auto" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
              <option value="transactionId">Transaction ID</option>
              <option value="userName">User Name</option>
              <option value="eventName">Event Name</option>
            </select>
            <div className="flex-1">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder={`Search by ${searchType === 'transactionId' ? 'Transaction ID' : searchType === 'userName' ? 'User Name' : 'Event Name'}`}
                value={search}
                onChange={(e) => {
                  const searchValue = e.target.value;
                  setSearch(searchValue);
                  setPaymentLogsPage(1);
                  setRevenuePage(1);

                  // Update the appropriate search field based on search type
                  if (searchType === 'transactionId') {
                    setTransactionId(searchValue);
                    setUserName('');
                    setEventName('');
                  } else if (searchType === 'userName') {
                    setTransactionId('');
                    setUserName(searchValue);
                    setEventName('');
                  } else if (searchType === 'eventName') {
                    setTransactionId('');
                    setUserName('');
                    setEventName(searchValue);
                  }

                  handleSearch();
                }}
              />
            </div>
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setTransactionId('');
                  setUserName('');
                  setEventName('');
                  setPaymentLogsPage(1);
                  setRevenuePage(1);
                  queryClient.invalidateQueries({ queryKey: ['paymentLogs'] });
                }}
                className="px-3 py-2 text-sm border rounded-md bg-gray-100 hover:bg-gray-200"
              >
                Clear
              </button>
            )}
            <select className="border rounded px-3 py-2 w-full md:w-auto" value={paymentLogsLimit} onChange={(e) => { setPaymentLogsPage(1); setPaymentLogsLimit(Number(e.target.value)); handleFilterChange(); }}>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-md border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Transaction ID</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-right">Sold Tickets</th>
              
                <th className="px-4 py-2 text-left">User/User ID</th>
                <th className="px-4 py-2 text-left">Event/Event ID</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const u: any = typeof log.user === 'string' ? { _id: log.user } : (log.user || {});
                const ev: any = typeof log.event === 'string' ? { _id: log.event } : (log.event || {});
                return (
                  <tr key={log._id} className="border-t">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </div>
                    </td>
                    <td className="px-4 py-2">{log.transactionId || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.status === 'succeeded' ? 'bg-green-100 text-green-800' : log.status === 'failed' ? 'bg-red-100 text-red-700' : log.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{log.status || '-'}</span>
                    </td>
                    <td className="px-4 py-2 text-right">₹{(log.amount ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{Array.isArray(log.tickets) ? log.tickets.length : 0}</td>
                   
                    <td className="px-4 py-2">
                      <div className="text-sm font-medium text-gray-900">
                        {u?.name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {u?._id || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm font-medium text-gray-900">
                        {ev?.title || 'Unknown Event'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ev?._id || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedPaymentLog(log);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 hover:underline text-xs"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to refund this payment?')) {
                              // TODO: Implement refund payment
                              console.log('Refund payment:', log._id);
                            }
                          }}
                          className="text-orange-600 hover:text-orange-900 hover:underline text-xs"
                        >
                          Refund
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Implement download receipt
                            console.log('Download receipt:', log._id);
                            // You can implement actual receipt download logic here
                          }}
                          className="text-green-600 hover:text-green-900 hover:underline text-xs"
                        >
                          Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">No payment logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination for Payment Logs Table */}
        <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-md border">
          <div className="text-sm text-gray-600">
            Page {paymentLogsPage} of {paymentLogsTotalPages} ({logs.length} transactions)
          </div>
          <div className="flex items-center space-x-1">
            <button
              className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              disabled={paymentLogsPage <= 1}
              onClick={() => {
                const newPage = Math.max(1, paymentLogsPage - 1);
                setPaymentLogsPage(newPage);
                queryClient.invalidateQueries({ queryKey: ['paymentLogs'] });
              }}
            >
              Previous
            </button>

            {/* Numbered pagination buttons */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, paymentLogsTotalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === paymentLogsPage;
                return (
                  <button
                    key={pageNum}
                    className={`px-3 py-2 text-sm border rounded-md ${isActive
                      ? 'bg-gray-900 text-white'
                      : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setPaymentLogsPage(pageNum);
                      queryClient.invalidateQueries({ queryKey: ['paymentLogs'] });
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Show ellipsis if there are more pages */}
              {paymentLogsTotalPages > 5 && paymentLogsPage < paymentLogsTotalPages - 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}

              {/* Show last page if it's not already shown */}
              {paymentLogsTotalPages > 5 && paymentLogsPage < paymentLogsTotalPages - 1 && (
                <button
                  className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
                  onClick={() => {
                    setPaymentLogsPage(paymentLogsTotalPages);
                    queryClient.invalidateQueries({ queryKey: ['paymentLogs'] });
                  }}
                >
                  {paymentLogsTotalPages}
                </button>
              )}
            </div>

            <button
              className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              disabled={paymentLogsPage >= paymentLogsTotalPages}
              onClick={() => {
                const newPage = Math.min(paymentLogsTotalPages, paymentLogsPage + 1);
                setPaymentLogsPage(newPage);
                queryClient.invalidateQueries({ queryKey: ['paymentLogs'] });
              }}
            >
              Next
            </button>
          </div>
        </div>

        {/* Revenue & Sales Summary Table */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Revenue & Sales Summary</h2>
          {_loading ? (
            <div className="text-center py-8">Loading sales data...</div>
          ) : _error ? (
            <div className="text-center text-red-500 py-8">Failed to fetch sales data</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No sales data available.</div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
                  <p className="text-2xl font-bold">
                    ₹{logs.reduce((total: number, log: any) => {
                      return total + (log.amount || 0);
                    }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-gray-600 text-sm font-medium">Total Tickets Sold</h3>
                  <p className="text-2xl font-bold">
                    {logs.reduce((total: number, log: any) => {
                      return total + (Array.isArray(log.tickets) ? log.tickets.length : 0);
                    }, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-gray-600 text-sm font-medium">Total Transactions</h3>
                  <p className="text-2xl font-bold">{logs.length}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="text-gray-600 text-sm font-medium">Admin Income (20%)</h3>
                  <p className="text-2xl font-bold">
                    ₹{logs.reduce((total: number, log: any) => {
                      return total + ((log.amount || 0) * 0.20);
                    }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Detailed Sales Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin (20%)</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.length > 0 ? (
                      logs.map((log: any) => {
                        const u: any = typeof log.user === 'string' ? { _id: log.user } : (log.user || {});
                        const ev: any = typeof log.event === 'string' ? { _id: log.event } : (log.event || {});
                        const ticketsCount = Array.isArray(log.tickets) ? log.tickets.length : 0;
                        const adminShare = (log.amount || 0) * 0.20;

                        function setSelectedEvent(_ev: any) {
                          throw new Error('Function not implemented.');
                        }

                        return (
                          <tr key={log._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {ev?.title || 'Unknown Event'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {ev?._id || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {u?.name || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {u?._id || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {ticketsCount.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                ₹{(log.amount || 0).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 text-amber-700">
                                ₹{adminShare.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-3">
                                <button 
                                  onClick={() => {
                                    setSelectedEvent(ev);
                                    setIsModalOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 hover:underline"
                                >
                                  View Event
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this payment record?')) {
                                      // TODO: Implement delete payment
                                      console.log('Delete payment:', log._id);
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No payment logs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

              {/* Pagination */}
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-gray-500">Page {revenuePage} of {paymentLogsTotalPages}</span>
                <div className="space-x-2">
                  <button 
                    className="px-3 py-1 border rounded disabled:opacity-50" 
                    disabled={revenuePage <= 1} 
                    onClick={() => setRevenuePage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <button 
                    className="px-3 py-1 border rounded disabled:opacity-50" 
                    disabled={revenuePage >= paymentLogsTotalPages} 
                    onClick={() => setRevenuePage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>

      </div>

      {/* Event View Modal */}
      {isModalOpen && selectedPaymentLog && (
        <PaymentLogModal
          isOpen={!!selectedPaymentLog}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPaymentLog(null);
          }}
          paymentLog={selectedPaymentLog}
        />
      )}
    </div>
  );
};

export default AdminPaymentLogsPage;
