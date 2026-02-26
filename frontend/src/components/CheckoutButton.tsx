import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { resolveApiRoot } from "../services/apiRoot";

let stripePromise: Promise<Stripe | null> | null = null;

function getStripe() {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
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
}

const CheckoutButton: React.FC<CheckoutProps> = ({
  tickets,
  eventId,
  buyerDetails,
}) => {
  const handleCheckout = async () => {
    const stripeOrPromise = getStripe();
    if (!stripeOrPromise) {
      alert("Stripe key not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY.");
      return;
    }

    const res = await fetch(`${resolveApiRoot()}/payments/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ tickets, eventId, buyerDetails }),
    });

    if (!res.ok) {
      return alert("Failed to start checkout. Please try again.");
    }

    const data = await res.json();
    const stripe = await stripeOrPromise;
    await stripe?.redirectToCheckout({ sessionId: data.id });
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
