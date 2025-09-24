import React, { useEffect, useMemo, useState } from "react";
import { getAdminPaymentLogs, type PaymentLog, type PaymentLogsParams } from "../../services/paymentService";
import SideBar from "../components/SideBar";

const AdminPaymentLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [eventId, setEventId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("last30");

  const params: PaymentLogsParams = useMemo(() => ({
    page,
    limit,
    eventId: eventId || undefined,
    userId: userId || undefined,
    transactionId: (transactionId || search) || undefined,
    status: status || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  }), [page, limit, eventId, userId, transactionId, status, search]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminPaymentLogs(params);
        if (!alive) return;
        setLogs(res.data || []);
        const p = res.pagination?.totalPages || 1;
        setTotalPages(Math.max(1, p));
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || "Failed to fetch payment logs");
        setLogs([]);
        setTotalPages(1);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [params]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar />
      <div className="flex-1 ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Payment Logs</h1>
            <button
              onClick={() => {
                const headers = ["Date","Transaction ID","User Name","Event Name","Amount","Currency","Status","Payment Method","Sold Tickets"];
                const rows = logs.map(l => [
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
                const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `payment_logs_page_${page}.csv`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Export CSV
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <select className="border border-gray-300 rounded-lg px-3 py-2 w-full lg:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={dateRange} onChange={(e)=>setDateRange(e.target.value)}>
                <option value="today">Today</option>
                <option value="last7">Last 7 days</option>
                <option value="last30">Last 30 days</option>
                <option value="all">All time</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-3 py-2 w-full lg:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
                <option value="">All Statuses</option>
                <option value="succeeded">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <div className="flex-1 w-full">
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Search by Transaction ID, User name, or Event name" value={search} onChange={(e)=>{ setPage(1); setSearch(e.target.value); setTransactionId(e.target.value); }} />
              </div>
              <select className="border border-gray-300 rounded-lg px-3 py-2 w-full lg:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="bg-white p-8 text-center text-gray-600 rounded-lg shadow-sm border">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading payment logs...
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 text-red-800 rounded-lg border border-red-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Error loading payment logs</h3>
                  <div className="mt-2 text-sm">{error}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold Tickets</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => {
                      const u: any = typeof log.user === 'string' ? { _id: log.user } : (log.user || {});
                      const ev: any = typeof log.event === 'string' ? { _id: log.event } : (log.event || {});
                      return (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{log.transactionId || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              log.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                              log.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {log.status || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {log.currency ? `${log.currency} ` : ''}{(log.amount ?? 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {Array.isArray(log.tickets) ? log.tickets.length : 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(log as any).provider || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {u?.name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ev?.title || '-'}
                          </td>
                        </tr>
                      );
                    })}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-sm font-medium text-gray-900 mb-1">No payment logs found</h3>
                            <p className="text-sm text-gray-500">Try adjusting your filters or date range.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm border">
              <div className="text-sm text-gray-700">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={true}
                >
                  {page}
                </button>
                <button
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentLogsPage;
