import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminPaymentLogs, type PaymentLogsParams, type PaymentLogsResponse, type PaymentLog } from '../../services/paymentService';
import SideBar from '../components/SideBar';
import PaymentLogModal from '../components/PaymentLogModal';

const AdminPaymentLogsPage = () => {
  // Payment Logs Table State
  const [paymentLogsPage, setPaymentLogsPage] = useState<number>(1);
  const [paymentLogsLimit, setPaymentLogsLimit] = useState<number>(10);

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

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('export-dropdown');
      const exportButton = document.querySelector('[data-export-button]');

      if (dropdown && !dropdown.contains(event.target as Node) && !exportButton?.contains(event.target as Node)) {
        dropdown.classList.add('hidden');
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
    queryClient.invalidateQueries({ queryKey: ['paymentLogs'] });
    refetch();
  };

  // Handle filters
  const handleFilterChange = () => {
    setPaymentLogsPage(1); // Reset payment logs to first page when filtering
    queryClient.invalidateQueries({ queryKey: ['paymentLogs'] });
    refetch();
  };

  if (_error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1117] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="text-red-500 dark:text-red-400 text-lg">Error loading payment logs</div>
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0F1117]">
      <SideBar />
      <div className="flex-1 p-4 pt-20 md:p-6 md:pt-6 space-y-8 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Payment Logs</h1>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('export-dropdown');
                dropdown?.classList.toggle('hidden');
              }}
              data-export-button
              className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 dark:bg-[#1F2933] dark:border-[#374151] dark:text-gray-100 flex items-center gap-2"
            >
              Export
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div
              id="export-dropdown"
              className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-[#1F2933] rounded-md shadow-lg border dark:border-[#374151] z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                <button
                  onClick={() => {
                    // CSV Export Logic
                    const headers = ["Date","Transaction ID","User Name","Event Name","Amount","Currency","Status","Payment Method","Sold Tickets"];
                    const rows = logs.map((l: PaymentLog) => [
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

                    // Hide dropdown
                    const dropdown = document.getElementById('export-dropdown');
                    dropdown?.classList.add('hidden');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#111827]"
                >
                  📄 Download CSV
                </button>
                <button
                  onClick={() => {
                    // PDF Export Logic
                    const printContent = `
                      <html>
                        <head>
                          <title>Payment Logs Report</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; font-weight: bold; }
                            h1 { color: #333; text-align: center; }
                            .header-info { margin-bottom: 20px; text-align: center; }
                            .summary { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
                            .amount { text-align: right; }
                          </style>
                        </head>
                        <body>
                          <h1>Payment Logs Report</h1>
                          <div class="header-info">
                            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Total Transactions:</strong> ${logs.length}</p>
                            <p><strong>Page:</strong> ${paymentLogsPage}</p>
                          </div>

                          <div class="summary">
                            <h3>Summary</h3>
                            <p><strong>Total Revenue:</strong> ₹${logs.reduce((total: number, log: any) => total + (log.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p><strong>Total Tickets Sold:</strong> ${logs.reduce((total: number, log: any) => total + (Array.isArray(log.tickets) ? log.tickets.length : 0), 0).toLocaleString()}</p>
                            <p><strong>Admin Income (20%):</strong> ₹${logs.reduce((total: number, log: any) => total + ((log.amount || 0) * 0.20), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>

                          <table>
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Transaction ID</th>
                                <th>User</th>
                                <th>Event</th>
                                <th class="amount">Amount</th>
                                <th>Status</th>
                                <th>Tickets</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${logs.map((log: PaymentLog) => `
                                <tr>
                                  <td>${new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                  <td>${log.transactionId || '-'}</td>
                                  <td>${typeof log.user === 'string' ? '' : (log.user?.name || 'Unknown User')}</td>
                                  <td>${typeof log.event === 'string' ? '' : (log.event?.title || 'Unknown Event')}</td>
                                  <td class="amount">₹${(log.amount ?? 0).toFixed(2)}</td>
                                  <td>${log.status || '-'}</td>
                                  <td>${Array.isArray(log.tickets) ? log.tickets.length : 0}</td>
                                </tr>
                              `).join('')}
                            </tbody>
                          </table>
                        </body>
                      </html>
                    `;

                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(printContent);
                      printWindow.document.close();
                      printWindow.print();
                    }

                    // Hide dropdown
                    const dropdown = document.getElementById('export-dropdown');
                    dropdown?.classList.add('hidden');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#111827]"
                >
                  📋 Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#1F2933] p-4 rounded-md border dark:border-[#374151] mb-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <select className="border rounded px-3 py-2 w-full md:w-auto bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-100 border-gray-300 dark:border-[#374151]" value={status} onChange={(e) => { setPaymentLogsPage(1); setStatus(e.target.value); handleFilterChange(); }}>
              <option value="">All Statuses</option>
              <option value="succeeded">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select className="border rounded px-3 py-2 w-full md:w-auto bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-100 border-gray-300 dark:border-[#374151]" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
              <option value="transactionId">Transaction ID</option>
              <option value="userName">User Name</option>
              <option value="eventName">Event Name</option>
            </select>
            <div className="flex-1">
              <input
                className="w-full border rounded px-3 py-2 bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-100 border-gray-300 dark:border-[#374151]"
                placeholder={`Search by ${searchType === 'transactionId' ? 'Transaction ID' : searchType === 'userName' ? 'User Name' : 'Event Name'}`}
                value={search}
                onChange={(e) => {
                  const searchValue = e.target.value;
                  setSearch(searchValue);
                  setPaymentLogsPage(1);

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
                  queryClient.invalidateQueries({ queryKey: ['paymentLogs'] });
                }}
                className="px-3 py-2 text-sm border rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-[#111827] dark:text-gray-100 dark:hover:bg-[#1F2933]"
              >
                Clear
              </button>
            )}
            <select className="border rounded px-3 py-2 w-full md:w-auto bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-100 border-gray-300 dark:border-[#374151]" value={paymentLogsLimit} onChange={(e) => { setPaymentLogsPage(1); setPaymentLogsLimit(Number(e.target.value)); handleFilterChange(); }}>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white dark:bg-[#1F2933] rounded-md border dark:border-[#374151]">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#111827] text-gray-700 dark:text-gray-200">
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
              {logs.map((log: PaymentLog) => {
                const u: any = typeof log.user === 'string' ? { _id: log.user } : (log.user || {});
                const ev: any = typeof log.event === 'string' ? { _id: log.event } : (log.event || {});
                return (
                  <tr key={log._id} className="border-t border-gray-200 dark:border-[#374151]">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-100">{log.transactionId || '-'}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.status === 'succeeded'
                            ? 'bg-green-100 text-green-800 dark:bg-emerald-900 dark:text-emerald-300'
                            : log.status === 'failed'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : log.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {log.status || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-100">₹{(log.amount ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-100">{Array.isArray(log.tickets) ? log.tickets.length : 0}</td>
                    <td className="px-4 py-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {u?.name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {u?._id || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {ev?.title || 'Unknown Event'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
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
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline text-xs"
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
                          className="text-orange-600 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-200 hover:underline text-xs"
                        >
                          Refund
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Implement download receipt
                            console.log('Download receipt:', log._id);
                            // You can implement actual receipt download logic here
                          }}
                          className="text-green-600 dark:text-green-300 hover:text-green-900 dark:hover:text-green-200 hover:underline text-xs"
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
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">No payment logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination for Payment Logs Table */}
        <div className="mt-6 flex items-center justify-between bg-white dark:bg-[#1F2933] px-4 py-3 rounded-md border dark:border-[#374151]">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Page {paymentLogsPage} of {paymentLogsTotalPages} ({logs.length} transactions)
          </div>
          <div className="flex items-center space-x-1">
            <button
              className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#111827] dark:border-[#374151] dark:text-gray-100"
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
                    className={`px-3 py-2 text-sm border rounded-md ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'hover:bg-gray-50 dark:hover:bg-[#111827]'
                    } dark:border-[#374151] dark:text-gray-100`}
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
                  className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-[#111827] dark:border-[#374151] dark:text-gray-100"
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
              className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#111827] dark:border-[#374151] dark:text-gray-100"
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

