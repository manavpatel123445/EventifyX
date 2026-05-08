import ManagerSideBar from "../components/ManagerSidebar"
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { EventViewModal } from '../../components'
import { getMyManagedEvents, type Event } from '../../services/eventService'
import { getManagerRevenue } from '../../services/adminService'
import { useSelector } from 'react-redux'
import { formatINR } from '../../utils/currency';
import { capitalizeFirstLetter } from '../../utils/roles';


const SaleRevenueList = () => {
  // Fix: Use Redux instead of useAuth hook to avoid re-parsing
  const user = useSelector((state: any) => state.auth.user);
  const [viewEvent, setViewEvent] = useState<Event | null>(null)
  
  // Fetch manager's events
  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['manager-events', 'list'], // Fix: Consistent cache key
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
      if (!user?._id) return null;
      const res = await getManagerRevenue(user._id);
      return res?.data || { revenueSplit: { manager: { amount: 0 } } };
    },
    enabled: !!user?._id
  });
  
  const events: Event[] = useMemo(() => Array.isArray(eventsData) ? eventsData : [], [eventsData])
  const isLoading = isLoadingEvents || isLoadingRevenue;
  
  return (
    <div className="flex bg-gray-50 dark:bg-[#1B1D2A] min-h-screen">
      <ManagerSideBar/>
      <div className="flex-1 p-8 space-y-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sale & Revenue</h1>
          </div>
          
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#212530] p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatINR(revenueData?.revenueSplit?.totalRevenue || 0)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg shadow border border-green-100 dark:border-green-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Your Share (80%)</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-300 mt-1">
                    {formatINR(revenueData?.revenueSplit?.manager?.amount || 0)}
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    {revenueData?.revenueSplit?.percentage?.manager || 80}% of total revenue
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 bg-opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Spending Table */}
       
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
                    upcoming: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
                    ongoing: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
                    completed: 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300',
                    cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
                  }[currentStatus] || 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300';
                  return (
                    <tr key={ev._id} className={`text-sm ${i % 2 === 0 ? 'bg-white dark:bg-[#212530]' : 'bg-gray-50 dark:bg-gray-800/30'} border-b border-gray-100 dark:border-gray-700/50`}>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{capitalizeFirstLetter(ev.title)}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{ev.category?.name ? capitalizeFirstLetter(ev.category.name) : '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-gray-900 dark:text-white">{new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          {new Date(`2000-01-01T${ev.startTime || '00:00'}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - {' '}
                          {new Date(`2000-01-01T${ev.endTime || '00:00'}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{ev.venue?.city ?? ''}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{sold}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{formatINR(revenue)}</td>
                      <td className="px-4 py-3 font-medium text-green-700 dark:text-green-400">
                        {formatINR(revenue * 0.8)}
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
                            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                    <td className="px-4 py-6 text-center text-gray-400 dark:text-gray-500" colSpan={9}>
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

export default SaleRevenueList