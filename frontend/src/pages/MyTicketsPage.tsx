import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Download, QrCode, User, CreditCard } from 'lucide-react';

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
  const { data: tickets, isLoading, error } = useQuery<Ticket[]>({
    queryKey: ['userTickets'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/tickets`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      return response.json();
    },
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Tickets</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't load your tickets. Please try again later.
          </p>
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

        {/* Tickets Grid */}
        <div className="grid gap-6">
          {tickets.map((ticket, index) => (
            <div key={ticket._id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* QR Code */}
                <div className="flex-shrink-0 text-center">
                  <div className="bg-white p-4 rounded-lg border border-border inline-block">
                    <img 
                      src={ticket.qrCode} 
                      alt="Ticket QR Code" 
                      className="w-24 h-24 mx-auto"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Scan at entry</p>
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
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">{ticket.event.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">{ticket.event.location}</span>
                        </div>
                      </div>
                    </div>

                    <div>
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
      </div>
    </div>
  );
};

export default MyTicketsPage;
