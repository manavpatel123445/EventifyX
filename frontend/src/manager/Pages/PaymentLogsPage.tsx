import React, { useEffect, useMemo, useState } from "react";
import { getPaymentLogs, type PaymentLog, type PaymentLogsParams } from "../../services/paymentService";

const ManagerPaymentLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [eventId, setEventId] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const params: PaymentLogsParams = useMemo(() => ({
    page,
    limit,
    eventId: eventId || undefined,
    transactionId: transactionId || undefined,
    status: status || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
    managerOnly: true,
  }), [page, limit, eventId, transactionId, status]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPaymentLogs(params);
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Events - Payment Logs</h1>

      <div className="bg-white p-4 rounded-md border mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Filter by Event ID" value={eventId} onChange={(e) => { setPage(1); setEventId(e.target.value); }} />
        <input className="border rounded px-3 py-2" placeholder="Filter by Transaction ID" value={transactionId} onChange={(e) => { setPage(1); setTransactionId(e.target.value); }} />
        <select className="border rounded px-3 py-2" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All Statuses</option>
          <option value="succeeded">Succeeded</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select className="border rounded px-3 py-2" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {loading ? (
        <div className="p-6 text-gray-600">Loading...</div>
      ) : error ? (
        <div className="p-6 text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-md border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Transaction ID</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-right">Sold Tickets</th>
                <th className="px-4 py-2 text-left">Event</th>
                <th className="px-4 py-2 text-left">Event ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
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
                    <td className="px-4 py-2">{ev?.title || '-'}</td>
                    <td className="px-4 py-2">{ev?._id || '-'}</td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No payment logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button className="px-3 py-2 border rounded disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
        <button className="px-3 py-2 border rounded disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
      </div>
    </div>
  );
};

export default ManagerPaymentLogsPage;



