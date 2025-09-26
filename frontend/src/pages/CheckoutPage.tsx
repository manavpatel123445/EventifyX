import React, { useEffect, useState } from "react";
import CheckoutButton from "../components/CheckoutButton";
import { Navbar } from "../components";
import { Footer } from "react-day-picker";
import { useLocation } from "react-router-dom";
import { getEventById, getDateSpecificTickets, type Event, type DateSpecificTicketsResponse } from "../services/eventService";

interface Ticket {
  type: "regular" | "vip" | "premium";
  price: number;
  quantity: number;
}

const CheckoutPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [event, setEvent] = useState<Event | null>(null);
  const [dateTickets, setDateTickets] = useState<DateSpecificTicketsResponse | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([
    { type: "regular", price: 0, quantity: 0 }
  ]);

  const [buyerDetails, setBuyerDetails] = useState<{
    name: string;
    email: string;
  }>({
    name: "",
    email: "",
  });
  const [consentChecked, setConsentChecked] = useState<boolean>(false);

  const query = new URLSearchParams(useLocation().search);
  const eventId = query.get("eventId") || "";
  const selectedDate = query.get("date") || "";
  useEffect(() => {
    // Prefill buyer details from stored user
    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setBuyerDetails(prev => ({
          name: u?.name || prev.name,
          email: u?.email || prev.email,
        }));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!eventId) return;
      try {
        // Load event data first
        const resp = await getEventById(eventId);
        const ev: Event = (resp as any)?.data ?? (resp as Event);
        setEvent(ev);

        // If date is selected, load date-specific tickets
        if (selectedDate) {
          const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
          const dateResp = await getDateSpecificTickets(eventId, selectedDate, userId || undefined);
          const dateData = (dateResp as any)?.data;

          if (dateData?.tickets) {
            setDateTickets(dateResp as DateSpecificTicketsResponse);
            setTickets(dateData.tickets.map((t: any) => ({
              type: t.type,
              price: t.price,
              quantity: 0
            })));
          }
        } else {
          // Load regular tickets for non-multi-day events
          const regular = Array.isArray(ev.ticketPricing)
            ? ev.ticketPricing.find(t => t.type === "regular")
            : undefined;
          setTickets([{ type: "regular", price: regular?.price ?? 0, quantity: 0 }]);
        }
      } catch (error) {
        console.error("Error loading checkout data:", error);
        // leave default
      }
    };
    load();
  }, [eventId, selectedDate]);

  const MAX_TICKETS_PER_BOOKING = 12;

  const handleQuantityChange = (index: number, value: number) => {
    const updated = [...tickets];

    // Calculate current total tickets
    const currentTotal = tickets.reduce((sum, t) => sum + (t === updated[index] ? 0 : t.quantity), 0);

    // Get date-specific availability if available
    const dateTicket = dateTickets?.data?.tickets?.[index];
    const remainingForUser = dateTicket?.remainingForUser ?? MAX_TICKETS_PER_BOOKING;

    // Ensure the new value doesn't exceed the limit when added to other tickets
    const newValue = Math.min(
      Math.max(0, value), // Can't go below 0
      Math.min(
        MAX_TICKETS_PER_BOOKING - currentTotal, // Can't exceed remaining tickets in global limit
        remainingForUser // Can't exceed remaining tickets for user for this ticket type
      )
    );

    updated[index].quantity = newValue;
    setTickets(updated);
  };

  const GST_RATE = 0.18; // 18% GST
  const BOOKING_FEE_RATE = 0.05; // 5% booking fee
  
  const subtotal = tickets.reduce(
    (sum, t) => sum + t.price * t.quantity,
    0
  );
  const bookingFee = Math.round(subtotal * BOOKING_FEE_RATE);
  const gstAmount = Math.round((subtotal + bookingFee) * GST_RATE);
  const totalAmount = subtotal + bookingFee + gstAmount;

// Check if there are no ticket types availabl
  if (!tickets || tickets.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="text-center text-gray-600">No ticket types available for this event.</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center w-full max-w-lg">
            {/* Step 1 - Date Selection */}
            <div className="flex flex-col items-center flex-1">
              <div className={`${step >= 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-gray-200 text-gray-500 border-gray-300'} w-8 h-8 flex items-center justify-center rounded-full border-2 text-base font-bold transition-all`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className={`${step >= 1 ? 'text-primary' : 'text-gray-500'} mt-2 text-sm font-medium`}>Select Date</span>
            </div>
            {/* Line */}
            <div className={`${step >= 2 ? 'bg-primary' : 'bg-gray-200'} flex-1 h-1 mx-2 rounded`}></div>
            {/* Step 2 - Ticket Selection */}
            <div className="flex flex-col items-center flex-1">
              <div className={`${step >= 2 ? 'bg-primary text-primary-foreground border-primary' : 'bg-gray-200 text-gray-500 border-gray-300'} w-8 h-8 flex items-center justify-center rounded-full border-2 text-base font-bold transition-all`}>
                {step > 2 ? '✓' : '2'}
              </div>
              <span className={`${step >= 2 ? 'text-primary' : 'text-gray-500'} mt-2 text-sm font-medium`}>Select Tickets</span>
            </div>
            {/* Line */}
            <div className={`${step >= 3 ? 'bg-primary' : 'bg-gray-200'} flex-1 h-1 mx-2 rounded`}></div>
            {/* Step 3 - Review & Pay */}
            <div className="flex flex-col items-center flex-1">
              <div className={`${step >= 3 ? 'bg-primary text-primary-foreground border-primary' : 'bg-gray-200 text-gray-500 border-gray-300'} w-8 h-8 flex items-center justify-center rounded-full border-2 text-base font-bold transition-all`}>3</div>
              <span className={`${step >= 3 ? 'text-primary' : 'text-gray-500'} mt-2 text-sm font-medium`}>Review & Pay</span>
            </div>
          </div>
        </div>
        {/* End Progress Bar */}

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Step 1: Date Selection for Multi-Day Events */}
      {step === 1 && event && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select Event Date</h2>

         
          {/* Event Information */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">{event.title}</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>📅 {(() => {
                const startDate = new Date(event.startDate);
                const endDate = new Date(event.endDate);
                const sameDay = startDate.toDateString() === endDate.toDateString();
                const fmt = (d: Date) => d.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                });
                return sameDay ? fmt(startDate) : `${fmt(startDate)} - ${fmt(endDate)}`;
              })()}</p>
              <p>⏰ {new Date(`2000-01-01T${event.startTime || '00:00'}`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}</p>
              <p>📍 {event.venue?.name}, {event.venue?.city}</p>
            </div>
          </div>

          {/* Show Debug Info */}
          <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs">
            <p>Debug: Event has {event.eventDates?.length || 0} dates</p>
            <p>Debug: Selected date: {selectedDate || 'none'}</p>
            <p>Debug: Should show date selection: {event.eventDates && event.eventDates.length > 1 ? 'YES' : 'NO'}</p>
            <p>Debug: Event spans multiple days: {(() => {
              const startDate = new Date(event.startDate);
              const endDate = new Date(event.endDate);
              return startDate.toDateString() !== endDate.toDateString() ? 'YES' : 'NO';
            })()}</p>
          </div>

          {/* Date Selection for Multi-Day Events */}
          {(() => {
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);
            const spansMultipleDays = startDate.toDateString() !== endDate.toDateString();

            // Show date selection if event spans multiple days OR has multiple eventDates
            return (spansMultipleDays || (event.eventDates && event.eventDates.length > 1)) && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose which date you want to attend:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(() => {
                    const datesToShow = [];

                    if (spansMultipleDays && (!event.eventDates || event.eventDates.length === 0)) {
                      // Generate dates from start to end date
                      const currentDate = new Date(startDate);
                      while (currentDate <= endDate) {
                        datesToShow.push({
                          date: currentDate.toISOString().split('T')[0],
                          isActive: true,
                          ticketAvailability: event.ticketPricing
                        });
                        currentDate.setDate(currentDate.getDate() + 1);
                      }
                    } else if (event.eventDates && event.eventDates.length > 0) {
                      // Use existing eventDates
                      datesToShow.push(...event.eventDates.filter(date => date.isActive !== false));
                    }

                    return datesToShow.map((eventDate) => {
                      const dateStr = eventDate.date;
                      const isSelected = selectedDate === dateStr;
                      const dateTickets = eventDate.ticketAvailability || event.ticketPricing;
                      const totalAvailable = dateTickets.reduce((sum, t) => sum + (t.quantity - (t.sold || 0)), 0);

                      // Check if date is in the past
                      const eventDateObj = new Date(dateStr);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Set to start of today
                      const isPastDate = eventDateObj < today;

                      // Skip past dates
                      if (isPastDate) {
                        return null;
                      }

                      // Determine availability state
                      const availabilityRate = totalAvailable / dateTickets.reduce((sum, t) => sum + t.quantity, 0);
                      let availabilityClass = 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
                      let availabilityIcon = '✅';

                      if (totalAvailable === 0) {
                        availabilityClass = 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed';
                        availabilityIcon = '🔴';
                      } else if (availabilityRate < 0.3) {
                        availabilityClass = 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200';
                        availabilityIcon = '🟠';
                      }

                      return (
                        <button
                          key={dateStr}
                          onClick={() => {
                            if (totalAvailable > 0) {
                              const url = new URL(window.location.href);
                              url.searchParams.set('date', dateStr);
                              window.history.replaceState({}, '', url.toString());
                              window.location.reload();
                            }
                          }}
                          disabled={totalAvailable === 0}
                          className={`p-3 text-left border-2 rounded-lg transition-all ${
                            isSelected
                              ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                              : `${availabilityClass} hover:shadow-md`
                          } ${totalAvailable === 0 ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {new Date(dateStr).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="text-xs">{availabilityIcon}</span>
                          </div>
                          <div className="text-xs">
                            {new Date(dateStr).toLocaleDateString('en-US', {
                              weekday: 'short'
                            })}
                          </div>
                          <div className="text-xs opacity-75">
                            {totalAvailable > 0 ? `${totalAvailable} left` : 'Sold out'}
                          </div>
                        </button>
                      );
                    }).filter(Boolean); // Remove null entries for past dates
                  })()}
                </div>
              </div>
            );
          })()}

          {/* Continue Button */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Continue to Ticket Selection →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Tickets */}
      {step === 2 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Select Tickets</h2>
            <button
              onClick={() => setStep(1)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Date Selection
            </button>
          </div>
          <div className="space-y-4">
            {tickets.map((ticket, i) => {
              const dateTicket = dateTickets?.data?.tickets?.[i];
              const available = dateTicket?.available ?? 0;
              const sold = dateTicket?.sold ?? 0;

              return (
                <div
                  key={ticket.type}
                  className="flex justify-between items-center border-b pb-3"
                >
                  <div>
                    <p className="font-medium capitalize">{ticket.type} Ticket</p>
                    <p className="text-gray-500">Original price: ₹{ticket.price}</p>
                    {dateTicket && (
                      <p className="text-xs text-gray-500">
                        Available: {available} | Sold: {sold}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(i, ticket.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                        disabled={ticket.quantity <= 0}
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{ticket.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(i, ticket.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                        disabled={
                          tickets.reduce((sum, t) => sum + t.quantity, 0) >= MAX_TICKETS_PER_BOOKING ||
                          (dateTicket && ticket.quantity >= dateTicket.remainingForUser)
                        }
                      >
                        +
                      </button>
                    </div>
                    {tickets.reduce((sum, t) => sum + t.quantity, 0) >= MAX_TICKETS_PER_BOOKING && (
                      <span className="text-xs text-red-500">Max {MAX_TICKETS_PER_BOOKING} tickets per booking</span>
                    )}
                    {dateTicket && ticket.quantity >= dateTicket.remainingForUser && (
                      <span className="text-xs text-orange-500">Max per user reached</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 min-w-24 text-right">
                    ₹{ticket.price * ticket.quantity}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Estimated Total */}
          <div className="mt-6 border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between">
              <div>
                <span className="text-gray-600">Booking Fee </span>
                <span className="text-xs text-gray-500">({(BOOKING_FEE_RATE * 100)}%)</span>:
              </div>
              <span>₹{bookingFee.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between">
              <div>
                <span className="text-gray-600">GST </span>
                <span className="text-xs text-gray-500">({GST_RATE * 100}% on ₹{(subtotal + bookingFee).toLocaleString('en-IN')})</span>:
              </div>
              <span>₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
              <span>Total Amount:</span>
              <span className="text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              * Inclusive of all taxes and fees
            </div>
          </div>

          {/* Buyer Info */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Your Details</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={buyerDetails.name}
              onChange={(e) =>
                setBuyerDetails({ ...buyerDetails, name: e.target.value })
              }
              className="w-full mb-3 px-3 py-2 border rounded-md"
            />
            <input
              type="email"
              placeholder="Email"
              value={buyerDetails.email}
              onChange={(e) =>
                setBuyerDetails({ ...buyerDetails, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="mt-6">
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                ← Back to Date Selection
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={totalAmount === 0 || !buyerDetails.email || tickets.reduce((sum, t) => sum + t.quantity, 0) > MAX_TICKETS_PER_BOOKING}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                title={tickets.reduce((sum, t) => sum + t.quantity, 0) > MAX_TICKETS_PER_BOOKING ? `Maximum ${MAX_TICKETS_PER_BOOKING} tickets allowed per booking` : ''}
              >
                {tickets.reduce((sum, t) => sum + t.quantity, 0) > MAX_TICKETS_PER_BOOKING 
                  ? `Maximum ${MAX_TICKETS_PER_BOOKING} tickets`
                  : 'Continue to Review →'}
              </button>
            </div>
            {tickets.reduce((sum, t) => sum + t.quantity, 0) > MAX_TICKETS_PER_BOOKING && (
              <p className="text-sm text-red-500 mt-2 text-center">
                Please reduce the number of tickets to {MAX_TICKETS_PER_BOOKING} or fewer to continue
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Review & Pay */}
      {step === 3 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Review & Pay</h2>
            <button
              onClick={() => setStep(2)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Ticket Selection
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            {tickets.filter((t) => t.quantity > 0).length === 0 ? (
              <div className="text-center text-gray-600">No tickets selected. Please go back and select at least one ticket.</div>
            ) : (
              <>
                {tickets
                  .filter((t) => t.quantity > 0)
                  .map((t) => (
                    <div
                      key={t.type}
                      className="flex justify-between text-gray-700 mb-2"
                    >
                      <span>
                        {t.quantity} x {t.type.toUpperCase()} Ticket
                      </span>
                      <span>₹{t.price * t.quantity}</span>
                    </div>
                  ))}
                <div className="border-t mt-2 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <div>
                      <span className="text-gray-600">Booking Fee </span>
                      <span className="text-xs text-gray-500">({(BOOKING_FEE_RATE * 100)}%)</span>:
                    </div>
                    <span>₹{bookingFee.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <div>
                      <span className="text-gray-600">GST </span>
                      <span className="text-xs text-gray-500">({GST_RATE * 100}% on ₹{(subtotal + bookingFee).toLocaleString('en-IN')})</span>:
                    </div>
                    <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                    <span>Total Amount:</span>
                    <span className="text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    * Inclusive of all taxes and fees
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Select State */}
          

          {/* Consent */}
          <div className="flex items-start gap-2 mb-4 text-sm text-gray-700">
            <input
              id="consent"
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="consent" className="leading-5">
              By proceeding, I express my consent to complete this transaction.
            </label>
          </div>

          {tickets.filter((t) => t.quantity > 0).length > 0 && (
            consentChecked ? (
              <CheckoutButton
                tickets={tickets.filter((t) => t.quantity > 0)}
                eventId={eventId}
                buyerDetails={buyerDetails}
              />
            ) : (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-600 px-6 py-3 rounded-md cursor-not-allowed"
              >
                Login to Proceed
              </button>
            )
          )}

          <button
            onClick={() => setStep(2)}
            className="mt-4 block text-gray-600 hover:underline"
          >
            ← Back to Ticket Selection
          </button>
        </div>
      )}
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
