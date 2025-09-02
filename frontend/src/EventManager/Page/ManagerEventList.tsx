import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import CreateEventModal from '../../components/CreateEventModal'
import UpdateEventModal from '../../components/UpdateEventModal'
import ManagerSideBar from '../components/ManagerSidebar'
import { cancelEvent, getMyManagedEvents, getRequestsForManagedEvents, type Event } from '../../services/eventService'

const ManagerEventList = () => {
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<Event | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['manager-managed-events', 'list'],
    queryFn: async () => {
      const res = await getMyManagedEvents({ page: 1, limit: 50 })
      const payload = (res as any)?.data ?? res
      return Array.isArray(payload?.events) ? payload.events as Event[] : []
    },
  })

  const { data: requestsData, isLoading: loadingReq } = useQuery({
    queryKey: ['manager-managed-events', 'requests'],
    queryFn: async () => {
      const res = await getRequestsForManagedEvents({})
      const payload = (res as any)?.data ?? res
      return Array.isArray(payload?.requests) ? payload.requests as any[] : []
    },
  })

  const events: Event[] = useMemo(() => Array.isArray(data) ? data : [], [data])
  const requests: any[] = useMemo(() => Array.isArray(requestsData) ? requestsData : [], [requestsData])

  const cancelMutation = useMutation({
    mutationFn: async (eventId: string) => cancelEvent(eventId),
    onSuccess: () => {
      toast.success('Event cancelled')
      queryClient.invalidateQueries({ queryKey: ['manager-managed-events'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to cancel'),
  })

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <ManagerSideBar/>
      <div className="flex-1 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Events</h1>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
            onClick={() => setCreateOpen(true)}
          >
            + Create Event
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-sm text-gray-600">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date/Time</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Tickets</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => {
                  const sold = typeof ev.totalBookings === 'number' ? ev.totalBookings : ev.ticketPricing?.reduce((a, t) => a + (t.sold ?? 0), 0) ?? 0
                  const revenue = typeof ev.totalRevenue === 'number' ? ev.totalRevenue : ev.ticketPricing?.reduce((a, t) => a + t.price * (t.sold ?? 0), 0) ?? 0
                  return (
                    <tr key={ev._id} className={`text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 font-medium">{ev.title}</td>
                      <td className="px-4 py-3">{ev.category?.name ?? '-'}</td>
                      <td className="px-4 py-3">{new Date(ev.startDate).toLocaleDateString()} {ev.startTime}</td>
                      <td className="px-4 py-3">{ev.venue?.city ?? ''}</td>
                      <td className="px-4 py-3">{sold}</td>
                      <td className="px-4 py-3">${revenue.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{ev.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <Link to={`/event/${ev.slug || ev._id}`} className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-50">View</Link>
                          <button onClick={() => setEditEvent(ev)} className="px-3 py-1 rounded border text-blue-600 hover:bg-blue-50">Update</button>
                          <button
                            disabled={cancelMutation.isPending || ev.status !== 'upcoming'}
                            onClick={() => cancelMutation.mutate(ev._id)}
                            className="px-3 py-1 rounded border text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {events.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-400" colSpan={8}>
                      {isLoading ? 'Loading events...' : 'No events yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Requests for managed events */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Requests Linked To Your Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-sm text-gray-600">
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Requested By</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reviewed By</th>
                  <th className="px-4 py-3">Reviewed At</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <tr key={req._id || i} className={`text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3">{req.approvedEvent?.title ?? '-'}</td>
                    <td className="px-4 py-3">{req.requestedBy?.name ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{req.status}</span>
                    </td>
                    <td className="px-4 py-3">{req.reviewedBy?.name ?? '-'}</td>
                    <td className="px-4 py-3">{req.reviewedAt ? new Date(req.reviewedAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-400" colSpan={5}>
                      {loadingReq ? 'Loading requests...' : 'No requests to show'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateEventModal isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} />
      {editEvent && (
        <UpdateEventModal
          isOpen={!!editEvent}
          onClose={() => setEditEvent(null)}
          event={editEvent}
        />
      )}
    </div>
  )
}

export default ManagerEventList