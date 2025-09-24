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
    <div className="flex min-h-screen">
      <SideBar />
      <div className="flex-1 p-6 space-y-8 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Payment Logs</h1>
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
            className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-gray-50"
          >
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-md border mb-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <select className="border rounded px-3 py-2 w-full md:w-auto" value={dateRange} onChange={(e)=>setDateRange(e.target.value)}>
              <option value="today">Today</option>
              <option value="last7">Last 7 days</option>
              <option value="last30">Last 30 days</option>
              <option value="all">All time</option>
            </select>
            <select className="border rounded px-3 py-2 w-full md:w-auto" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
              <option value="">All Statuses</option>
              <option value="succeeded">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <div className="flex-1">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Search by Transaction ID, User name, or Event name"
                value={search}
                onChange={(e)=>{ setPage(1); setSearch(e.target.value); setTransactionId(e.target.value); }}
              />
            </div>
            <select className="border rounded px-3 py-2 w-full md:w-auto" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}>
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
              
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">User ID</th>
                <th className="px-4 py-2 text-left">Event</th> 
                <th className="px-4 py-2 text-left">Event ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const u: any = typeof log.user === 'string' ? { _id: log.user } : (log.user || {});
                const ev: any = typeof log.event === 'string' ? { _id: log.event } : (log.event || {});
                return (
                  <tr key={log._id} className="border-t">
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">{log.transactionId || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${log.status === 'succeeded' ? 'bg-green-100 text-green-800' : log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{log.status || '-'}</span>
                    </td>
                    <td className="px-4 py-2 text-right">{log.currency ? `${log.currency} ` : ''}{(log.amount ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{Array.isArray(log.tickets) ? log.tickets.length : 0}</td>
                   
                    <td className="px-4 py-2">{u?.name || '-'}</td>
                    <td className="px-4 py-2">{u?._id || '-'}</td>
                    <td className="px-4 py-2">{ev?.title || '-'}</td>
                    <td className="px-4 py-2">{ev?._id || '-'}</td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center text-gray-500">No payment logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border rounded disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            <button className={`px-3 py-2 border rounded bg-gray-900 text-white`}>{page}</button>
            <button className="px-3 py-2 border rounded disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentLogsPage;
