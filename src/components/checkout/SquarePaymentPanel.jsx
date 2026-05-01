import React from 'react';
import {
  ArrowLeft, CreditCard, Mail, AlertCircle, Loader2, Send, ShieldCheck, Lock,
  CheckCircle2, ExternalLink, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TurnstileWidget from '@/components/TurnstileWidget';

export default function SquarePaymentPanel({
  onBack,
  squareSent,
  squareEmail,
  setSquareEmail,
  squareSending,
  squareCheckoutUrl,
  squareError,
  turnstileToken,
  setTurnstileToken,
  subtotal,
  discount,
  processingFee,
  totalUSD,
  SHIPPING_COST,
  customerInfo,
  cartItems,
  onSendLink,
  onResend,
}) {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <CreditCard className="w-8 h-8 text-[#dc2626]" />
      </div>

      {!squareSent ? (
        <>
          <h2 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">Pay with Card</h2>
          <p className="text-slate-500 font-medium mb-8 text-sm">
            We'll send a secure Square payment link to your email. Click the link to complete your purchase with any debit or credit card.
          </p>

          {/* Order breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl mb-6 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-600">Discount</span>
                <span className="text-green-600 font-bold">-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Shipping</span>
              <span className="text-slate-900 font-bold">${SHIPPING_COST.toFixed(2)}</span>
            </div>
            {processingFee > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Processing Fee (10%)</span>
                <span className="text-slate-900 font-bold">${processingFee.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Total</span>
              <span className="text-2xl font-black text-slate-900">${totalUSD.toFixed(2)}</span>
            </div>
          </div>

          {/* Email input */}
          <div className="text-left mb-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={squareEmail}
                onChange={(e) => setSquareEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#dc2626] transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              We'll send your payment link to this email address.
            </p>
          </div>

          {/* Cloudflare Turnstile bot protection */}
          <div className="flex justify-center mb-4">
            <TurnstileWidget
              action="checkout"
              theme="light"
              onSuccess={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken(null)}
              onExpired={() => setTurnstileToken(null)}
            />
          </div>

          {squareError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4 text-left">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-bold">{squareError}</p>
            </div>
          )}

          {/* Send Payment Link button */}
          <Button
            onClick={() => onSendLink(false)}
            disabled={squareSending || !squareEmail?.trim() || !turnstileToken}
            className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-xs py-6 shadow-lg shadow-[#dc2626]/20 disabled:opacity-50 mb-3"
          >
            {squareSending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating Checkout...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> Send Payment Link</>
            )}
          </Button>

          {/* PAY NOW button */}
          <p className="text-[10px] text-slate-400 text-center mb-3 font-medium">— or pay directly —</p>
          <Button
            onClick={() => onSendLink(true)}
            disabled={squareSending || !squareEmail?.trim() || !turnstileToken}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase tracking-widest text-sm py-6 shadow-lg shadow-green-200 disabled:opacity-50"
          >
            {squareSending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Opening Checkout...</>
            ) : (
              <>PAY NOW <ChevronRight className="w-5 h-5 ml-1" /></>
            )}
          </Button>
          <p className="text-[10px] text-slate-400 text-center mt-2 font-medium mb-6">Generates link &amp; opens Square checkout directly</p>

          <div className="mt-2 flex justify-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
              <ShieldCheck className="w-3 h-3 text-slate-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Powered by Square</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
              <Lock className="w-3 h-3 text-slate-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Secure Payment</span>
            </div>
          </div>
        </>
      ) : (
        /* ── Success state ── */
        <>
          <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">
            Payment Link <span className="text-green-500">Sent!</span>
          </h2>
          <p className="text-slate-500 font-medium mb-2 text-sm">
            We've sent a secure payment link to:
          </p>
          <p className="text-lg font-black text-slate-900 mb-6">{squareEmail}</p>

          {squareCheckoutUrl && (
            <div className="mb-6">
              <a href={squareCheckoutUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black uppercase tracking-widest text-sm py-5 rounded-xl shadow-lg transition-all">
                <ExternalLink className="w-5 h-5" />
                Complete Payment Now
              </a>
              <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">Opens Square secure checkout in a new tab</p>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6 text-left">
            <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2">What's Next?</h4>
            <ol className="text-sm text-blue-700 font-medium space-y-1.5 list-decimal list-inside">
              <li>Click <strong>"Complete Payment Now"</strong> above, or check your email</li>
              <li>Enter your card details on the secure Square checkout page</li>
              <li>You'll receive an order confirmation once payment is complete</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onResend}
              variant="outline"
              className="flex-1 border-slate-200 rounded-xl font-black uppercase tracking-widest text-xs py-5"
            >
              <Mail className="w-4 h-4 mr-2" /> Resend
            </Button>
            <Link to={createPageUrl('Home')} className="flex-1">
              <Button className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-xs py-5">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}