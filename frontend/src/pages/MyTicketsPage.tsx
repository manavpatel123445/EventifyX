import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Download, QrCode, User, CreditCard, Search, Filter, ArrowDown, ArrowUp, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface Ticket {
  _id: string;
  type: string;
  price: number;
  status: string;
  qrCode: string;
  seatNumber: string;
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
  createdAt: string;
}

const MyTicketsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Ticket; direction: 'asc' | 'desc' } | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Get token from both localStorage and sessionStorage
  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const { data: tickets = [], isLoading, error, refetch } = useQuery<Ticket[]>({
    queryKey: ['userTickets'],
    queryFn: async () => {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found. Redirecting to login...');
        // Redirect to login page if not in a protected route
        if (!window.location.pathname.includes('login')) {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
        throw new Error('Not authenticated. Please log in again.');
      }
      
      console.log('Auth token being sent:', token ? `${token.substring(0, 10)}...` : 'No token');
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/tickets`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('Authentication error, clearing tokens:', errorData);
          // Clear all auth tokens
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          // Redirect to login with current path
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          throw new Error('Session expired. Please log in again.');
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(errorData.message || `Failed to fetch tickets (${response.status})`);
        }
        
        const data = await response.json();
        return data.map((ticket: Ticket) => ({
          ...ticket,
          event: {
            ...ticket.event,
            date: format(new Date(ticket.event.date), 'MMM d, yyyy h:mm a')
          }
        }));
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    },
  });

  const filteredTickets = tickets
    .filter(ticket => {
      const matchesSearch = ticket.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'all' || ticket.status === activeFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const requestSort = (key: keyof Ticket) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Ticket) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const downloadTicket = (ticket: Ticket) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EVENT TICKET', canvas.width / 2, 60);

    // Event details
    ctx.font = '24px Arial';
    ctx.fillText(ticket.event.title, canvas.width / 2, 100);
    
    ctx.font = '18px Arial';
    ctx.fillText(ticket.event.date, canvas.width / 2, 130);
    ctx.fillText(ticket.event.location, canvas.width / 2, 155);

    // QR Code
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, canvas.width / 2 - 100, 200, 200, 200);
      
      // Ticket details
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Ticket Type: ${ticket.type.toUpperCase()}`, 50, 450);
      ctx.fillText(`Seat: ${ticket.seatNumber}`, 50, 475);
      ctx.fillText(`Price: $${ticket.price}`, 50, 500);
      ctx.fillText(`Status: ${ticket.status.toUpperCase()}`, 50, 525);

      // Download
      const link = document.createElement('a');
      link.download = `ticket-${ticket._id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    qrImg.src = ticket.qrCode;
  };

  // Handle unauthenticated users
  if (error?.message?.includes('No authentication token') || error?.message?.includes('Not authenticated')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your tickets</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Loading your tickets...</h1>
            <p className="text-gray-600">Please wait while we fetch your tickets.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading tickets</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error.message || 'An unknown error occurred'}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-muted-foreground mb-4">
            <QrCode className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">No Tickets Yet</h1>
          <p className="text-muted-foreground mb-6">
            You haven't purchased any tickets yet. Browse events and book your first ticket!
          </p>
          <button
            onClick={() => window.location.href = '/events'}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Tickets</h1>
          <p className="text-muted-foreground">
            You have {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select 
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="all">All Tickets</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No tickets found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTickets.map((ticket) => (
              <div key={ticket._id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* QR Code */}
                  <div className="flex-shrink-0 text-center">
                    <div className="bg-white p-4 rounded-lg border border-border inline-block hover:shadow-md transition-shadow">
                      <img 
                        src={ticket.qrCode} 
                        alt="Ticket QR Code" 
                        className="w-24 h-24 mx-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket._id)}`;
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Scan at entry</p>
                    <button 
                      onClick={() => downloadTicket(ticket)}
                      className="mt-2 text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-1 mx-auto"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {ticket.event.title}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">{ticket.event.date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">{ticket.event.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {ticket.payment.currency.toUpperCase()} {ticket.payment.amount}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="space-y-2 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-muted-foreground">Type:</span>
                              <span className="font-medium text-foreground">
                                {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="w-4 h-4 flex items-center justify-center">
                                <div className={`w-2 h-2 rounded-full ${
                                  ticket.status === 'confirmed' ? 'bg-green-500' : 
                                  ticket.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                              </span>
                              <span className="text-muted-foreground">Status:</span>
                              <span className={`font-medium ${
                                ticket.status === 'confirmed' ? 'text-green-600' : 
                                ticket.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">Seat:</span>
                            <span className="font-medium text-foreground">{ticket.seatNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">Price:</span>
                            <span className="font-medium text-foreground">₹{ticket.price}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ticket.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : ticket.status === 'used'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {ticket.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-center space-y-2">
                    <button
                      onClick={() => downloadTicket(ticket)}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    
                    <div className="text-xs text-muted-foreground text-center">
                      Purchased {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;
