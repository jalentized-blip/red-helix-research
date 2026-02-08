import React, { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Shield, CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import ConsentModal from '@/components/financial/ConsentModal';
import { useMFA } from '@/components/security/MFAProvider';

export default function PlaidACHCheckout({ order, onSuccess, onError }) {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { requireMFA } = useMFA();

  // Check if user has already given financial consent
  useEffect(() => {
    checkExistingConsent();
  }, []);

  const checkExistingConsent = async () => {
    try {
      const user = await base44.auth.me();
      const consents = await base44.entities.FinancialConsent.filter({
        user_email: user.email,
        consent_type: 'plaid_ach',
        consent_given: true
      });

      if (consents && consents.length > 0) {
        // Check if consent is still valid (not withdrawn)
        const validConsent = consents.find(c => !c.withdrawal_timestamp);
        if (validConsent) {
          setConsentGiven(true);
        }
      }
    } catch (error) {
      console.error('Error checking consent:', error);
    }
  };

  const createLinkToken = async () => {
    try {
      setLoading(true);
      const { data } = await base44.functions.invoke('plaidCreateLinkToken', {});
      if (data?.link_token) {
        setLinkToken(data.link_token);
      } else {
        throw new Error('No link token received');
      }
    } catch (error) {
      console.error('Error creating link token:', error);
      onError?.(error.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const onPlaidSuccess = useCallback(async (public_token, metadata) => {
    try {
      setLoading(true);

      // Exchange token and store payment method
      const { data } = await base44.functions.invoke('plaidExchangeToken', {
        public_token,
        account_id: metadata.account_id,
        metadata: metadata
      });

      if (data.success) {
        setPaymentMethod(data.payment_method);
      } else {
        throw new Error('Failed to save payment method');
      }
    } catch (error) {
      console.error('Error exchanging token:', error);
      onError?.(error.message || 'Failed to connect bank account');
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: (err) => {
      if (err) {
        console.error('Plaid Link exit error:', err);
        onError?.(err.error_message || 'Payment setup cancelled');
      }
    }
  };

  const { open, ready } = usePlaidLink(config);

  const handleConnectBank = async () => {
    if (!consentGiven) {
      setShowConsent(true);
    } else {
      // Require MFA BEFORE showing Plaid Link
      await requireMFA('plaid_link', async () => {
        await createLinkToken();
      });
    }
  };

  const handleConsentGiven = async () => {
    setConsentGiven(true);
    setShowConsent(false);
    await createLinkToken();
  };

  useEffect(() => {
    if (ready && linkToken) {
      console.log('Opening Plaid Link - ready:', ready, 'linkToken:', !!linkToken);
      open();
    }
  }, [ready, linkToken, open]);

  const handlePayment = async () => {
    if (!paymentMethod) return;

    try {
      setProcessingPayment(true);

      // Require MFA for financial transaction
      await requireMFA('payment_processing', async () => {
        const { data } = await base44.functions.invoke('plaidCreatePayment', {
          order_id: order.order_number,
          amount: order.total_amount,
          plaid_item_id: paymentMethod.id
        });

        if (data.success) {
          onSuccess?.(data);
        } else {
          throw new Error(data.error || 'Payment failed');
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      onError?.(error.message || 'Payment processing failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Downtime Notice */}
      <div className="p-4 bg-amber-950/20 border border-amber-700/30 rounded-xl mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-stone-300">
            <p className="font-semibold text-amber-500 mb-1">Service Temporarily Unavailable</p>
            <p>
              ACH payments are currently down for maintenance. We apologize for the inconvenience. 
              Please verify your order details, and we will email you as soon as payment services are restored.
            </p>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="p-4 bg-green-950/20 border border-green-700/30 rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <p className="text-sm text-green-300 font-medium mb-1">
              Secure Bank Payment via Plaid
            </p>
            <p className="text-xs text-stone-400">
              Bank-level encryption. Your login credentials are never stored. Powered by Plaid's secure infrastructure.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method Display */}
      {paymentMethod ? (
        <div className="p-4 bg-stone-800/50 border border-stone-700 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 border border-blue-600/30 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {paymentMethod.institution_name}
                </p>
                <p className="text-xs text-stone-400">
                  {paymentMethod.account_type} ••••{paymentMethod.account_mask}
                </p>
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        </div>
      ) : (
        <Button
          onClick={handleConnectBank}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              Connect Bank Account
            </>
          )}
        </Button>
      )}

      {/* Order Summary */}
      <div className="p-4 bg-stone-900/60 border border-stone-700 rounded-xl">
        <h4 className="text-sm font-bold text-white mb-3">Order Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-stone-400">Order Number</span>
            <span className="text-white font-medium">{order.order_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-400">Items</span>
            <span className="text-white">{order.items?.length || 0}</span>
          </div>
          <div className="pt-2 border-t border-stone-700 flex justify-between">
            <span className="text-white font-bold">Total Amount</span>
            <span className="text-2xl font-bold text-white">
              ${order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Complete Payment Button */}
      {paymentMethod && (
        <Button
          onClick={handlePayment}
          disabled={processingPayment}
          className="w-full"
          size="lg"
        >
          {processingPayment ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              Complete Payment - ${order.total_amount.toFixed(2)}
            </>
          )}
        </Button>
      )}

      {/* Important Notice */}
      <div className="p-4 bg-blue-950/20 border border-blue-700/30 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-stone-400 space-y-1">
            <p>• ACH payments typically take 3-5 business days to process</p>
            <p>• Your order will ship once payment is confirmed</p>
            <p>• You'll receive email notifications on payment status</p>
            <p>• All financial data is encrypted and PCI compliant</p>
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsent}
        onClose={() => setShowConsent(false)}
        onConsent={handleConsentGiven}
        consentType="plaid_ach"
      />
    </div>
  );
}