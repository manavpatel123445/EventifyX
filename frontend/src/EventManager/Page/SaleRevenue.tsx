import ManagerSideBar from "../components/ManagerSidebar"
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { EventViewModal } from '../../components'
import { getMyManagedEvents, type Event } from '../../services/eventService'
import { getManagerRevenue } from '../../services/adminService'
import useAuth from '../../hooks/useAuth'
import { capitalizeFirstLetter } from '../../utils/roles';


const SaleRevanue = () => {
  const { user } = useAuth()
  const [viewEvent, setViewEvent] = useState<Event | null>(null)
  
  // Fetch manager's events
  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['manager-managed-events', 'list'],
    queryFn: async () => {
      const res = await getMyManagedEvents({ page: 1, limit: 50 })
      const payload = (res as any)?.data ?? res
      return Array.isArray(payload?.events) ? payload.events as Event[] : []
    },
  })
  
  // Fetch manager's revenue data
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['manager-revenue'],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await getManagerRevenue(user.id);
      return res?.data || { revenueSplit: { admin: { amount: 0 }, manager: { amount: 0 } } };
    },
    enabled: !!user?.id
  });
  
  const events: Event[] = useMemo(() => Array.isArray(eventsData) ? eventsData : [], [eventsData])
  const isLoading = isLoadingEvents || isLoadingRevenue;
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <ManagerSideBar/>
      <div className="flex-1 p-8 space-y-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Sale & Revenue</h1>
          </div>
          
          {/* Revenue Summary Cards */}
          

           {/* Revenue Summary Cards */}
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
                  <th className="px-4 py-3">Total Revenue</th>
                  <th className="px-4 py-3">Your Share (80%)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
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
                    upcoming: 'bg-green-100 text-green-700',
                    ongoing: 'bg-blue-100 text-blue-700',
                    completed: 'bg-gray-100 text-gray-700',
                    cancelled: 'bg-red-100 text-red-700',
                  }[currentStatus] || 'bg-gray-100 text-gray-700';
                  return (
                    <tr key={ev._id} className={`text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 font-medium">{capitalizeFirstLetter(ev.title)}</td>
                      <td className="px-4 py-3">{ev.category?.name ? capitalizeFirstLetter(ev.category.name) : '-'}</td>
                      <td className="px-4 py-3">{new Date(ev.startDate).toLocaleDateString()} {ev.startTime}</td>
                      <td className="px-4 py-3">{ev.venue?.city ?? ''}</td>
                      <td className="px-4 py-3">{sold}</td>
                      <td className="px-4 py-3">₹{revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 font-medium text-green-700">
                        ₹{(revenue * 0.8).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
                          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => setViewEvent(ev)} 
                            className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-50"
                          >
                            View
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
      </div>
      {viewEvent && (
        <EventViewModal
          isOpen={!!viewEvent}
          onClose={() => setViewEvent(null)}
          event={viewEvent}
        />
      )}
    </div>
  )
}

export default SaleRevanue