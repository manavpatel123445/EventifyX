/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import CreateEventModal from '../../components/CreateEventModal'
import CreateCategoryModal from '../../components/CreateCategoryModal'
import UpdateEventModal from '../../components/UpdateEventModal'
import { EventViewModal } from '../../components'
import ManagerSideBar from '../components/ManagerSidebar'
import { cancelEvent, getMyManagedEvents, getRequestsForManagedEvents, type Event, requestEventCancellation } from '../../services/eventService'
import { capitalizeFirstLetter } from '../../utils/roles'

const ManagerEventList = () => {
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<Event | null>(null)
  const [viewEvent, setViewEvent] = useState<Event | null>(null)
  const [page, setPage] = useState(1)
  const limit = 10

  const queryClient = useQueryClient()

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['manager-managed-events', 'list', { page, limit }],
    queryFn: async () => {
      const res = await getMyManagedEvents({ page, limit })
      const payload = (res as any)?.data ?? res
      return {
        events: Array.isArray(payload?.events) ? payload.events as Event[] : [],
        pagination: payload?.pagination ?? { total: 0, pages: 1 }
      }
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

  const events: Event[] = useMemo(
    () => (eventsData?.events ?? []) as Event[],
    [eventsData]
  )
  const totalPages = eventsData?.pagination?.pages ?? 1
  const requests: any[] = useMemo(() => Array.isArray(requestsData) ? requestsData : [], [requestsData])

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const handleCancelClick = (event: Event) => {
    setSelectedEvent(event);
    setShowCancelDialog(true);
  };

  const cancelMutation = useMutation({
    mutationFn: async (eventId: string) => cancelEvent(eventId),
    onSuccess: () => {
      toast.success('Event cancelled')
      queryClient.invalidateQueries({ queryKey: ['manager-managed-events'] })
      setShowCancelDialog(false)
      setSelectedEvent(null)
      setCancelReason('')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to cancel'),
  })

  const requestCancelMutation = useMutation({
    mutationFn: async ({ eventId, reason }: { eventId: string; reason: string }) => 
      requestEventCancellation(eventId, reason),
    onSuccess: () => {
      toast.success('Cancellation request sent to admin for review')
      queryClient.invalidateQueries({ queryKey: ['manager-managed-events'] })
      setShowCancelDialog(false)
      setSelectedEvent(null)
      setCancelReason('')
    },
    onError: (err: any) => 
      toast.error(err?.response?.data?.message || 'Failed to send cancellation request'),
  })

  function handleCancelRequest(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    if (!selectedEvent || !cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    
    requestCancelMutation.mutate({
      eventId: selectedEvent._id,
      reason: cancelReason.trim()
    });
  }

  return (
    <div className="flex bg-gray-50 dark:bg-[#1B1D2A] min-h-screen">
      <ManagerSideBar/>
      <div className="flex-1 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Events</h1>
          <div className="flex items-center gap-2">
            <button
              className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-600 dark:hover:bg-blue-700 transition"
              onClick={() => setCategoryModalOpen(true)}
            >
              + Create Category
            </button>
            <button
              className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-600 dark:hover:bg-red-700 transition"
              onClick={() => setCreateOpen(true)}
            >
              + Create Event
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#212530] rounded-2xl shadow p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800/50 text-left text-sm text-gray-600 dark:text-gray-400">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date/Time</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Tickets</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => {
                  const sold = typeof ev.totalBookings === 'number' ? ev.totalBookings : ev.ticketPricing?.reduce((a, t) => a + (t.sold ?? 0), 0) ?? 0
                  const revenue = typeof ev.totalRevenue === 'number' ? ev.totalRevenue : ev.ticketPricing?.reduce((a, t) => a + t.price * (t.sold ?? 0), 0) ?? 0
                  
                  const now = new Date();
                  const endDate = new Date(ev.endDate);
                  let currentStatus = ev.status;

                  if (ev.status !== 'cancelled' && endDate < now) {
                    currentStatus = 'completed';
                  }

                  const statusColorClass = {
                    upcoming: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
                    ongoing: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
                    completed: 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300',
                    cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
                  }[currentStatus] || 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300';

                  return (
                    <tr key={ev._id} className={`text-sm ${i % 2 === 0 ? 'bg-white dark:bg-[#212530]' : 'bg-gray-50 dark:bg-gray-800/30'} border-b border-gray-100 dark:border-gray-700/50`}>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{capitalizeFirstLetter(ev.title)}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{ev.category?.name ? capitalizeFirstLetter(ev.category.name) : '-'}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{new Date(ev.startDate).toLocaleDateString()} {ev.startTime}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{ev.venue?.city ?? ''}</td>
                      <td className="px-4 py-3">{sold}</td>
                      <td className="px-4 py-3">₹{revenue.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
                          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => setViewEvent(ev)} 
                            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            View
                          </button>
                          <button onClick={() => setEditEvent(ev)} className="px-3 py-1 rounded border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">Update</button>
                          <button
                            onClick={() => handleCancelClick(ev)}
                            disabled={cancelMutation.isPending || ev.status !== 'upcoming'}
                            className="px-3 py-1 rounded border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
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
                    <td className="px-4 py-6 text-center text-gray-400 dark:text-gray-500" colSpan={8}>
                      {isLoading ? 'Loading events...' : 'No events yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </button>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </div>
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Requests for managed events */}
        <div className="bg-white dark:bg-[#212530] rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Requests Linked To Your Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800/50 text-left text-sm text-gray-600 dark:text-gray-400">
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Requested By</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reviewed By</th>
                  <th className="px-4 py-3">Reviewed At</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <tr key={req._id || i} className={`text-sm ${i % 2 === 0 ? 'bg-white dark:bg-[#212530]' : 'bg-gray-50 dark:bg-gray-800/30'} border-b border-gray-100 dark:border-gray-700/50`}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{req.approvedEvent?.title ? capitalizeFirstLetter(req.approvedEvent.title) : '-'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{req.requestedBy?.name ? capitalizeFirstLetter(req.requestedBy.name) : '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">{req.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{req.reviewedBy?.name ? capitalizeFirstLetter(req.reviewedBy.name) : '-'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{req.reviewedAt ? new Date(req.reviewedAt).toLocaleString() : '-'}</td>
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

      {/* Cancel Event Dialog */}
      {showCancelDialog && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#212530] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Request Event Cancellation</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              You are about to request cancellation for: <strong>{capitalizeFirstLetter(selectedEvent.title)}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for cancellation (required):
              </label>
              <textarea
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 min-h-[100px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Please provide a reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelDialog(false)
                  setSelectedEvent(null)
                  setCancelReason('')
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={cancelMutation.isPending || requestCancelMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={!cancelReason.trim() || cancelMutation.isPending || requestCancelMutation.isPending}
                className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50"
              >
                {cancelMutation.isPending || requestCancelMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
      {viewEvent && (
        <EventViewModal
          isOpen={!!viewEvent}
          onClose={() => setViewEvent(null)}
          event={viewEvent}
        />
      )}
      
      <CreateEventModal 
        isOpen={isCreateOpen} 
        onClose={() => setCreateOpen(false)} 
        onSuccess={() => {
          setCreateOpen(false);
          // Refresh the events list
          queryClient.invalidateQueries({ queryKey: ['managedEvents'] });
        }} 
      />
      <CreateCategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
      />
      
      <UpdateEventModal
        isOpen={!!editEvent}
        onClose={() => setEditEvent(null)}
        event={editEvent}
        onSuccess={() => {
          setEditEvent(null);
          // Refresh the events list
          queryClient.invalidateQueries({ queryKey: ['managedEvents'] });
        }}
      />
    </div>
  )
}

export default ManagerEventList