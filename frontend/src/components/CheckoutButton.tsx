import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { createCheckoutSession } from "../services/paymentService";

let stripePromise: Promise<Stripe | null> | null = null;

function getStripe() {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  if (!key) {
    console.error("Missing VITE_STRIPE_PUBLISHABLE_KEY env variable");
    return null;
  }

  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

interface CheckoutProps {
  tickets: { type: string; price: number; quantity: number }[];
  eventId: string;
  buyerDetails: { name: string; email: string };
  selectedDate?: string; // ISO date string (e.g., '2025-09-30')
}

const CheckoutButton: React.FC<CheckoutProps> = ({
  tickets,
  eventId,
  buyerDetails,
  selectedDate,
}) => {
  const handleCheckout = async () => {
    const stripeOrPromise = getStripe();
    if (!stripeOrPromise) {
      alert("Stripe key not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY.");
      return;
    }

    try {
      const data = await createCheckoutSession(eventId, tickets, buyerDetails, selectedDate);
      const stripe = await stripeOrPromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.id });
      } else {
        alert("Failed to load Stripe. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition"
    >
      Pay with Stripe
    </button>
  );
};

export default CheckoutButton;
