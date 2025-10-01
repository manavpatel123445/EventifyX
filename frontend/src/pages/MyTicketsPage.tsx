import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Download, Calendar, MapPin } from 'lucide-react';
import  Footer  from '../components/Footer';
import  Navbar  from '../components/Navbar';

interface Ticket {
  _id: string;
  type: string;
  price: number;
  status: string;
  qrCode: string;
  seatNumber: string;
  eventDate?: string; // Specific date when the ticket is valid for multi-date events
  event: {
    _id: string;
    title: string;
    date: string;
    location: string;
    image: string;
  };
  payment: {
    _id: string;
    amount: number;
    currency: string;
    status: string;
  };
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

const MyTicketsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  const sessionId = searchParams.get('session_id');
  const API_ROOT = import.meta.env.VITE_API_BASE_URL || '';

  // Unique event options from tickets
  const eventOptions = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    for (const t of tickets) {
      const id = t.event?._id;
      if (id && !map.has(id)) {
        map.set(id, { id, title: t.event?.title || 'Event' });
      }
    }
    return Array.from(map.values());
  }, [tickets]);

  // Filtered tickets by event
  const filteredTickets = useMemo(() => {
    if (selectedEventId === 'all') return tickets;
    return tickets.filter(t => t.event?._id === selectedEventId);
  }, [tickets, selectedEventId]);

  // Pagination derived values
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredTickets.length / pageSize)), [filteredTickets.length, pageSize]);
  useEffect(() => {
    // Reset to first page when filter changes
    setPage(1);
  }, [selectedEventId, pageSize]);
  useEffect(() => {
    // Clamp page if data shrinks
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);
  const pagedTickets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, page, pageSize]);

  const buildDefaultTicket = (): Ticket => ({
    _id: `placeholder-${Date.now()}`,
    type: 'general',
    price: 0,
    status: 'processing',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Processing',
    seatNumber: 'TBD',
    event: {
      _id: 'unknown',
      title: 'Ticket processing...',
      date: new Date().toLocaleString(),
      location: 'TBD',
      image: ''
    },
    payment: {
      _id: sessionId || 'unknown',
      amount: 0,
      currency: 'IND',
      status: 'processing'
    },
    user: {
      name: 'You',
      email: ''
    },
    createdAt: new Date().toISOString()
  });

  // Normalize backend ticket shape to UI expectation
  const normalizeTicket = (t: any): Ticket => {
    const ev = t?.event || {};
    const payment = t?.payment || {};
    // Determine if ticket is expired based on event date/endDate
    const endDateStr = (ev?.endDate || ev?.date || ev?.startDate || '').toString();
    const endDate = endDateStr ? new Date(endDateStr) : null;
    const isExpired = endDate ? (new Date() > endDate) : false;
    return {
      _id: String(t?._id || ''),
      type: String(t?.type || 'regular'),
      price: Number(t?.price || 0),
      status: isExpired ? 'expired' : String(t?.status || 'active'),
      qrCode: String(t?.qrCode || ''),
      seatNumber: String(t?.seatNumber || ''),
      event: {
        _id: String(ev?._id || ''),
        title: String(ev?.title || 'Event'),
        date: String(ev?.date || ev?.startDate || ev?.endDate || new Date().toISOString()),
        location: String(ev?.location || (typeof ev?.venue === 'object' ? ev.venue?.name || ev.venue?.city || ev.venue?.address || JSON.stringify(ev.venue) : ev?.venue) || 'Venue not specified'),
        image: String(ev?.image || (Array.isArray(ev?.images) ? ev.images[0] : '') || ''),
      },
      payment: {
        _id: String(payment?._id || payment || ''),
        amount: Number(payment?.amount || 0),
        currency: String(payment?.currency || 'IND'),
        status: String(payment?.status || 'succeeded'),
      },
      user: {
        name: String(t?.user?.name || 'You'),
        email: String(t?.user?.email || ''),
      },
      createdAt: String(t?.createdAt || new Date().toISOString()),
    };
  };

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      // Helper: try multiple possible backend endpoints for "my tickets"
      const fetchMyTicketsWithFallbacks = async (): Promise<Ticket[]> => {
        const bases = [API_ROOT || ''];
        const paths = [
          '/api/payments/tickets'
        ];
        const errors: string[] = [];
        for (const base of bases) {
          for (const path of paths) {
            try {
              const res = await fetch(`${base}${path}` || path, { headers });
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) return data as Ticket[];
                errors.push(`${path}: non-array response`);
              } else {
                const txt = await res.text();
                errors.push(`${path}: ${res.status} ${txt?.slice(0, 120)}`);
              }
            } catch (e: any) {
              errors.push(`${path}: ${e?.message || 'network error'}`);
            }
          }
        }
        console.warn('All my-tickets endpoints failed', errors);
        return [];
      };

      if (!sessionId) {
        // No session id; try to fetch all tickets for the logged-in user
        try {
          const data = await fetchMyTicketsWithFallbacks();
          setTickets(Array.isArray(data) ? data.map(normalizeTicket) : []);
          if (!Array.isArray(data) || data.length === 0) {
            setError('You have no tickets yet.');
          } else {
            setError(null);
          }
        } catch (err) {
          console.error('Error fetching my tickets:', err);
          setTickets([]);
          setError('Failed to load your tickets. Please try again.');
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        // Try to fetch tickets by session; if not yet created, poll briefly
        const response = await fetch(`${API_ROOT}/api/payments/tickets/session/${sessionId}`, { headers });
        
        if (!response.ok) {
          // Poll up to ~10s while webhook processes
          const start = Date.now();
          while (Date.now() - start < 10000) {
            await new Promise(r => setTimeout(r, 1500));
            const r2 = await fetch(`${API_ROOT}/api/payments/tickets/session/${sessionId}`, { headers });
            if (r2.ok) {
              const d2 = await r2.json();
              setTickets(Array.isArray(d2) ? d2.map(normalizeTicket) : []);
              setLoading(false);
              return;
            } else {
              await r2.text();
            }
          }
          // After polling, still not ready — use a default placeholder ticket
          setTickets([buildDefaultTicket()]);
          setError('Tickets are being generated. Your payment succeeded, and tickets will appear shortly.');
          setLoading(false);
          return;
        }

        const data = await response.json();
        // If backend returns empty array, still show default placeholder
        setTickets(Array.isArray(data) && data.length > 0 ? data.map(normalizeTicket) : [buildDefaultTicket()]);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        // Network or other error: still present a default ticket so users aren’t blocked
        setTickets([buildDefaultTicket()]);
        setError('Failed to load tickets from server. Showing a temporary placeholder.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [sessionId]);

  // If tickets are still processing (placeholder), keep polling periodically until real tickets arrive
  useEffect(() => {
    if (!sessionId) return;
    const stillProcessing = tickets.some(t => t.status === 'processing');
    if (!stillProcessing) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const r = await fetch(`${API_ROOT}/api/payments/tickets/session/${sessionId}`, { headers });
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data) && data.length > 0) {
            setTickets(data.map(normalizeTicket));
            setError(null);
            clearInterval(interval);
          }
        }
      } catch {
        // ignore transient errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId, tickets]);

  const downloadTicket = (ticket: Ticket) => {
    // Prevent download for expired tickets
    if (ticket.status === 'expired') {
      alert('This ticket has expired and cannot be downloaded.');
      return;
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for better quality
    const scale = 2; // For better quality on high-DPI displays
    const width = 800;
    const height = 1000;
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Event Header
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('YOUR TICKET', 400, 50);

    // Event details
    ctx.font = '24px Arial';
    ctx.fillStyle = '#111827';
    ctx.fillText(ticket.event?.title || 'Event', 400, 90);
    
    // Date and location
    ctx.font = '16px Arial';
    ctx.fillStyle = '#4b5563';
    ctx.textAlign = 'center';
    ctx.fillText(ticket.event?.date ? new Date(ticket.eventDate || ticket.event.date).toLocaleDateString() : 'Date not specified', 400, 120);
    ctx.fillText(ticket.event?.location || 'Venue not specified', 400, 145);

    // Divider
    ctx.strokeStyle = '#e5e7eb';
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(50, 170);
    ctx.lineTo(750, 170);
    ctx.stroke();
    ctx.setLineDash([]);

    // QR Code
    const qrImg = new Image();
    qrImg.crossOrigin = 'Anonymous';
    qrImg.onload = () => {
      // Draw QR code with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(300, 200, 200, 200);
      ctx.drawImage(qrImg, 300, 200, 200, 200);
      
      // Ticket details
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#111827';
      
      // Ticket info section
      ctx.fillText('TICKET INFORMATION', 50, 250);
      
      ctx.font = '14px Arial';
      ctx.fillStyle = '#4b5563';
      
      const details = [
        { label: 'Type', value: ticket.type?.toUpperCase() || 'GENERAL' },
        { label: 'Seat', value: ticket.seatNumber || 'GENERAL ADMISSION' },
        { label: 'Price', value: `₹${ticket.price?.toFixed(2) || '0.00'}` },
        { label: 'Status', value: ticket.status?.toUpperCase() || 'ACTIVE' },
        { label: 'Ticket ID', value: `#${ticket._id.slice(-8).toUpperCase()}` }
      ];
      
      // Draw ticket details
      details.forEach((detail, index) => {
        const y = 290 + (index * 25);
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`${detail.label}:`, 50, y);
        ctx.fillStyle = '#111827';
        ctx.fillText(detail.value, 200, y);
      });

      // Draw footer
      ctx.font = '12px Arial';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      ctx.fillText('Present this ticket at the event entrance', 400, 950);
      ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, 400, 970);

      // Download
      const link = document.createElement('a');
      link.download = `${ticket.event?.title?.replace(/\s+/g, '-').toLowerCase() || 'ticket'}-${ticket._id.slice(-6)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    // Handle QR code loading errors
    qrImg.onerror = () => {
      // If QR code fails to load, use a generated one with the ticket ID
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket._id)}`;
    };
    
    qrImg.src = ticket.qrCode;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">No Tickets Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'We couldn\'t find your tickets. Please contact support if you believe this is an error.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Tickets</h1>
          <p className="text-gray-600">Manage and view your event tickets</p>
        </div>

        {/* Event Filter */}
        <div className="max-w-4xl mx-auto mb-6 flex items-center gap-3">
          <label className="text-sm text-gray-600">Filter by event:</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All events</option>
            {eventOptions.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-gray-600">Per page:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value={4}>4</option>
              <option value={6}>6</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid gap-6 max-w-4xl mx-auto">
          {pagedTickets.map((ticket) => (
            <div key={ticket._id} className="relative overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              {/* Ticket Styling Elements */}
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-purple-600"></div>
              
              <div className="flex flex-col md:flex-row">
                {/* Left Section - Event Image */}
                <div className="md:w-1/3 bg-gray-100 p-6 flex items-center justify-center">
                  {ticket.event?.image ? (
                    <img 
                      src={ticket.event.image} 
                      alt={ticket.event.title} 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">{ticket.event?.title?.charAt(0) || 'E'}</span>
                    </div>
                  )}
                </div>
                
              {/* Middle Section - Ticket Details */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <button
                      onClick={() => ticket.event?._id && navigate(`/events/${ticket.event._id}`)}
                      className="text-left text-xl font-bold text-gray-900 mb-1 hover:text-blue-600"
                      title="View event details"
                    >
                      {ticket.event?.title || 'Event Title'}
                    </button>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(ticket.eventDate || ticket.event?.date || new Date()).toLocaleDateString()}</span>
                      <MapPin className="w-4 h-4 ml-3 mr-1" />
                      <span>{ticket.event?.location || 'Venue'}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    #{ticket._id.slice(-6).toUpperCase()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Ticket Type</p>
                      <p className="font-medium">{ticket.type || 'General Admission'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Seat</p>
                      <p className="font-medium">{ticket.seatNumber || 'General Admission'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Price</p>
                      <p className="font-medium">₹{ticket.price.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.status === 'active' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status === 'processing' ? (
                          <svg className="animate-spin -ml-1 mr-1.5 h-2.5 w-2.5 text-yellow-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : null}
                        {ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'Active'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Purchased by</p>
                      <p className="font-medium">{ticket.user?.name || 'You'}</p>
                      <p className="text-xs text-gray-500">{ticket.user?.email || ''}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => downloadTicket(ticket)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={ticket.status === 'processing' || ticket.status === 'expired'}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {ticket.status === 'processing' ? 'Processing...' : ticket.status === 'expired' ? 'Expired' : 'Download'}
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Right Section - QR Code */}
                <div className="flex-shrink-0 text-center p-6 border-l border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <img 
                      src={ticket.qrCode} 
                      alt="Ticket QR Code" 
                      className="w-32 h-32 mx-auto"
                      onError={(e) => { 
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket._id)}`;
                      }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-700">
                    {ticket.status === 'processing' ? 'Generating...' : 'Scan this QR code at entry'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Ticket ID: {ticket._id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {tickets.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2m5-11a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets yet</h3>
              <p className="text-gray-500">Your purchased tickets will appear here</p>
              <button 
                onClick={() => navigate('/events')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Events
              </button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredTickets.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-2 border rounded-md bg-white disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 border rounded-md bg-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default MyTicketsPage;
