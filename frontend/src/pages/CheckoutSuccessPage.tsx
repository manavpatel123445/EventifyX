import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Download, Calendar, MapPin, User, CreditCard } from 'lucide-react';

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
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchTickets = async () => {
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        // Try to fetch tickets by session; if not yet created, poll briefly
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/tickets/session/${sessionId}`);
        
        if (!response.ok) {
          // Poll up to ~10s while webhook processes
          const start = Date.now();
          let lastErr: any = null;
          while (Date.now() - start < 10000) {
            await new Promise(r => setTimeout(r, 1500));
            const r2 = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/tickets/session/${sessionId}`);
            if (r2.ok) {
              const d2 = await r2.json();
              setTickets(d2);
              setLoading(false);
              return;
            } else {
              lastErr = await r2.text();
            }
          }
          throw new Error('Failed to fetch tickets');
        }

        const data = await response.json();
        setTickets(data);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [sessionId]);

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

  if (error || tickets.length === 0) {
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

  const event = tickets[0]?.event;
  const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your tickets have been generated and are ready to use.
          </p>
        </div>

        {/* Event Summary */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Event Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">{event?.title}</p>
                <p className="text-sm text-muted-foreground">{event?.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-primary" />
              <p className="text-muted-foreground">{event?.location}</p>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Your Tickets ({tickets.length})</h2>
          
          {tickets.map((ticket, index) => (
            <div key={ticket._id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* QR Code */}
                <div className="flex-shrink-0 text-center">
                  <div className="bg-white p-4 rounded-lg border border-border inline-block">
                    <img 
                      src={ticket.qrCode} 
                      alt="Ticket QR Code" 
                      className="w-32 h-32 mx-auto"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Scan at entry</p>
                </div>

                {/* Ticket Details */}
                <div className="flex-1">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Ticket #{index + 1}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium text-foreground">{ticket.type.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">Seat:</span>
                          <span className="font-medium text-foreground">{ticket.seatNumber}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium text-foreground">${ticket.price}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Purchased by</p>
                        <p className="font-medium text-foreground">{ticket.user?.name}</p>
                        <p className="text-sm text-muted-foreground">{ticket.user?.email}</p>
                      </div>
                      
                      <button
                        onClick={() => downloadTicket(ticket)}
                        className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Ticket</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Summary */}
        <div className="bg-card border border-border rounded-lg p-6 mt-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Total Paid</h3>
              <p className="text-sm text-muted-foreground">{tickets.length} ticket(s)</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">${totalAmount}</p>
              <p className="text-sm text-muted-foreground">USD</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate('/my-tickets')}
            className="flex-1 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors"
          >
            View All Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
