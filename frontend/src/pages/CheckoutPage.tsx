import React, { useEffect, useState } from "react";
import CheckoutButton from "../components/CheckoutButton";
import { Navbar } from "../components";
import { Footer } from "react-day-picker";
import { useLocation } from "react-router-dom";
import { getEventById, type Event } from "../services/eventService";

interface Ticket {
  type: "regular" | "vip" | "premium";
  price: number;
  quantity: number;
}

const useQuery = () => new URLSearchParams(useLocation().search);

const CheckoutPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [tickets, setTickets] = useState<Ticket[]>([
    { type: "regular", price: 0, quantity: 0 }
  ]);

  const [buyerDetails, setBuyerDetails] = useState({
    name: "",
    email: "",
  });

  const [selectedState, setSelectedState] = useState<string>("");
  const [consentChecked, setConsentChecked] = useState<boolean>(false);

  const query = useQuery();
  const eventId = query.get("eventId") || "";

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
        const resp = await getEventById(eventId);
        const ev: Event = (resp as any)?.data ?? (resp as Event);
        const regular = Array.isArray(ev.ticketPricing)
          ? ev.ticketPricing.find(t => t.type === "regular")
          : undefined;
        setTickets([{ type: "regular", price: regular?.price ?? 0, quantity: 0 }]);
      } catch {
        // leave default
      }
    };
    load();
  }, [eventId]);

  const handleQuantityChange = (index: number, value: number) => {
    const updated = [...tickets];
    updated[index].quantity = Math.max(0, value);
    setTickets(updated);
  };

  const subtotal = tickets.reduce(
    (sum, t) => sum + t.price * t.quantity,
    0
  );
  const bookingFee = Math.round(subtotal * 0.12); // 12% booking fee example
  const totalAmount = subtotal + bookingFee;

  // Check if there are no ticket types available
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
          <div className="flex items-center w-full max-w-md">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`${step === 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-gray-200 text-gray-500 border-gray-300'} w-8 h-8 flex items-center justify-center rounded-full border-2 text-base font-bold transition-all`}>1</div>
              <span className={`${step === 1 ? 'text-primary' : 'text-gray-500'} mt-2 text-sm font-medium`}>Select Tickets</span>
            </div>
            {/* Line */}
            <div className={`${step === 2 ? 'bg-primary' : 'bg-gray-200'} flex-1 h-1 mx-2 rounded`}></div>
            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`${step === 2 ? 'bg-primary text-primary-foreground border-primary' : 'bg-gray-200 text-gray-500 border-gray-300'} w-8 h-8 flex items-center justify-center rounded-full border-2 text-base font-bold transition-all`}>2</div>
              <span className={`${step === 2 ? 'text-primary' : 'text-gray-500'} mt-2 text-sm font-medium`}>Review & Pay</span>
            </div>
          </div>
        </div>
        {/* End Progress Bar */}

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select Tickets</h2>
          <div className="space-y-4">
            {tickets.map((ticket, i) => (
              <div
                key={ticket.type}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-medium capitalize">{ticket.type} Ticket</p>
                  <p className="text-gray-500">Original price: ₹{ticket.price}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(i, ticket.quantity - 1)}
                      disabled={ticket.quantity <= 0}
                      className="w-8 h-8 flex items-center justify-center rounded-md border text-gray-700 disabled:opacity-50"
                      aria-label={`Decrease ${ticket.type} quantity`}
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center inline-block">{ticket.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(i, ticket.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md border text-gray-700"
                      aria-label={`Increase ${ticket.type} quantity`}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 min-w-24 text-right">
                    ₹{ticket.price * ticket.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Estimated Total */}
          <div className="mt-4 bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Sub-total</span>
              <span className="font-medium">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Booking Fee (est.)</span>
              <span className="font-medium">₹{bookingFee}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Estimated Total</span>
              <span>₹{totalAmount}</span>
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

          <button
            onClick={() => setStep(2)}
            disabled={totalAmount === 0 || !buyerDetails.email}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Review & Pay</h2>
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
                <div className="border-t mt-2 pt-2 flex justify-between">
                  <span className="text-gray-600">Sub-total</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-gray-600">Booking Fee</span>
                  <span className="font-medium">₹{bookingFee}</span>
                </div>
                <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span>₹{totalAmount}</span>
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
            onClick={() => setStep(1)}
            className="mt-4 block text-gray-600 hover:underline"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
    <Footer/>
    </>
  );
};

export default CheckoutPage;
