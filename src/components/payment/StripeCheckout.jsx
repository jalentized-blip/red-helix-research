import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, CreditCard } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// TODO: Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = ({ onSuccess, onError, totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // This url is used if the payment requires redirection (e.g. 3DS)
          return_url: window.location.origin + '/payment-completed',
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message);
        onError && onError(error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess && onSuccess(paymentIntent.id);
      } else {
        // This handles cases like "processing" or "requires_action" if not redirected
        if (paymentIntent && paymentIntent.status === 'processing') {
            setMessage("Payment is processing.");
        } else {
            setMessage("Unexpected payment state.");
        }
      }
    } catch (e) {
        setMessage("An unexpected error occurred.");
        console.error(e);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {message && <div className="text-red-600 text-sm font-medium">{message}</div>}
      <Button 
        disabled={isLoading || !stripe || !elements} 
        className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-6 rounded-xl shadow-lg shadow-red-600/20"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Pay Securely ${totalAmount.toFixed(2)}</span>
          </div>
        )}
      </Button>
      <div className="flex justify-center items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        <Lock className="w-3 h-3" />
        <span>256-bit SSL Encrypted Payment</span>
      </div>
    </form>
  );
};

export default function StripeCheckout({ totalAmount, onSuccess, onError }) {
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    const createIntent = async () => {
        try {
            const { data } = await base44.functions.invoke('createStripePaymentIntent', { amount: totalAmount });
            if (data && data.clientSecret) {
                setClientSecret(data.clientSecret);
            } else {
                setError("Failed to initialize payment.");
            }
        } catch (err) {
            console.error("Error creating payment intent:", err);
            setError("Could not connect to payment server.");
            onError && onError(err);
        }
    };
    createIntent();
  }, [totalAmount]);

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#dc2626',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '12px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (error) {
      return <div className="text-red-600 font-medium text-center p-4">{error}</div>;
  }

  return (
    <div className="w-full">
      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm onSuccess={onSuccess} onError={onError} totalAmount={totalAmount} />
        </Elements>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <p className="text-slate-500 text-sm font-medium animate-pulse">Initializing Secure Gateway...</p>
        </div>
      )}
    </div>
  );
}
