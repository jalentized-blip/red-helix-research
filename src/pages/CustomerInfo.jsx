import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { validateCartStock, getCart } from '@/components/utils/cart';

export default function CustomerInfo() {
  const navigate = useNavigate();
  

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('customerInfo');
    return saved ? JSON.parse(saved) : {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      billingAddress: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
      shippingAddress: '',
      shippingCity: '',
      shippingState: '',
      shippingZip: '',
      sameAsShipping: true
    };
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
    if (!formData.email.trim()) newErrors.email = 'Email required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone required';
    if (!formData.billingAddress.trim()) newErrors.billingAddress = 'Billing address required';
    if (!formData.billingCity.trim()) newErrors.billingCity = 'City required';
    if (!formData.billingState.trim()) newErrors.billingState = 'State required';
    if (!formData.billingZip.trim()) newErrors.billingZip = 'ZIP code required';

    if (!formData.sameAsShipping) {
      if (!formData.shippingAddress.trim()) newErrors.shippingAddress = 'Shipping address required';
      if (!formData.shippingCity.trim()) newErrors.shippingCity = 'City required';
      if (!formData.shippingState.trim()) newErrors.shippingState = 'State required';
      if (!formData.shippingZip.trim()) newErrors.shippingZip = 'ZIP code required';
    }

    return newErrors;
  };

  const handleContinue = async () => {
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check if we came from Account page or Cart
    const isUpdatingFromAccount = document.referrer.includes('Account') || window.location.search.includes('source=account');

    // Verify research acknowledgment checkbox is checked (only for checkout flow)
    if (!isUpdatingFromAccount) {
      const researchAck = document.getElementById('researchAck');
      if (!researchAck || !researchAck.checked) {
        alert('You must certify that you are a qualified researcher and will use these products for research purposes only.');
        return;
      }
    }

    // Save to localStorage
    const customerData = {
      ...formData,
      shippingAddress: formData.sameAsShipping ? formData.billingAddress : formData.shippingAddress,
      shippingCity: formData.sameAsShipping ? formData.billingCity : formData.shippingCity,
      shippingState: formData.sameAsShipping ? formData.billingState : formData.shippingState,
      shippingZip: formData.sameAsShipping ? formData.billingZip : formData.shippingZip,
    };

    localStorage.setItem('customerInfo', JSON.stringify(customerData));
    
    if (isUpdatingFromAccount) {
      alert('Information updated successfully!');
      navigate(createPageUrl('Account'));
    } else {
      // Re-validate cart against live DB before proceeding — catches phantom specs
      const { removed } = await validateCartStock(base44);
      if (removed.length > 0) {
        const freshCart = getCart();
        if (freshCart.length === 0) {
          alert('All items in your cart are no longer available. Please return to the shop and add valid products.');
          navigate(createPageUrl('Cart'));
          return;
        }
        alert(`The following items were removed because they are no longer available:\n\n${removed.join('\n')}\n\nPlease review your cart before continuing.`);
        navigate(createPageUrl('Cart'));
        return;
      }

      // Save a pre-checkout snapshot immediately — so we have name/email/address
      // even if they abandon at the payment step
      try {
        const cart = JSON.parse(localStorage.getItem('rdr_cart') || '[]');
        const promo = localStorage.getItem('rdr_promo');
        const preSnapshot = {
          stage: 'customer_info_submitted',
          timestamp: new Date().toISOString(),
          customerName: `${customerData.firstName} ${customerData.lastName}`.trim(),
          customerEmail: customerData.email,
          customerPhone: customerData.phone,
          shippingAddress: {
            address: customerData.shippingAddress,
            city: customerData.shippingCity,
            state: customerData.shippingState,
            zip: customerData.shippingZip,
          },
          items: cart,
          promoCode: promo || null,
        };
        localStorage.setItem('rhr_pre_checkout_snapshot', JSON.stringify(preSnapshot));
      } catch (_) {}
      // Ensure we redirect to the correct checkout page
      navigate(createPageUrl('CryptoCheckout'));
    }
  };

  const shippingData = formData.sameAsShipping ? 
    { city: formData.billingCity, state: formData.billingState, zip: formData.billingZip, address: formData.billingAddress } :
    { city: formData.shippingCity, state: formData.shippingState, zip: formData.shippingZip, address: formData.shippingAddress };

  const isFromAccount = window.location.search.includes('source=account');

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-[#dc2626] rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[-10%] w-[600px] h-[600px] bg-slate-400 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <Link to={isFromAccount ? createPageUrl('Account') : createPageUrl('Cart')} className="inline-flex items-center gap-2 text-[#dc2626] hover:text-[#b91c1c] mb-6 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" />
            ← Back to {isFromAccount ? 'Account' : 'Cart'}
          </Link>

          {/* Checkout Steps */}
          {!isFromAccount && (
            <div className="flex items-center gap-2 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-green-500 text-white text-xs font-black flex items-center justify-center">✓</div>
                <span className="text-xs font-bold text-green-600">Cart</span>
              </div>
              <div className="flex-1 h-px bg-slate-200 mx-1" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#dc2626] text-white text-xs font-black flex items-center justify-center">2</div>
                <span className="text-xs font-bold text-[#dc2626]">Your Info</span>
              </div>
              <div className="flex-1 h-px bg-slate-200 mx-1" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-400 text-xs font-black flex items-center justify-center">3</div>
                <span className="text-xs font-bold text-slate-400">Payment</span>
              </div>
            </div>
          )}
          <h1 className="text-5xl font-black text-black uppercase tracking-tighter leading-none">
            {isFromAccount ? 'Update' : 'Your'} <span className="text-[#dc2626]">{isFromAccount ? 'Profile' : 'Information'}</span>
          </h1>
          <p className="text-slate-500 mt-4 font-medium">
            {isFromAccount ? 'Update your saved contact and shipping details.' : 'Enter your contact and shipping details to complete your order.'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-[40px] p-10 space-y-10 shadow-sm"
        >
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#fef2f2] rounded-lg flex items-center justify-center">
                <span className="text-[#dc2626] font-black text-xs">01</span>
              </div>
              <h2 className="text-xl font-black text-black uppercase tracking-tight">Contact Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">First Name *</label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-300 rounded-xl h-12 font-bold focus:border-[#dc2626] focus:ring-[#dc2626]/20"
                  placeholder="John"
                />
                {errors.firstName && <p className="text-[#dc2626] text-[10px] font-bold uppercase tracking-widest mt-1">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Last Name *</label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-300 rounded-xl h-12 font-bold focus:border-[#dc2626] focus:ring-[#dc2626]/20"
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-[#dc2626] text-[10px] font-bold uppercase tracking-widest mt-1">{errors.lastName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Email *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-300 rounded-xl h-12 font-bold focus:border-[#dc2626] focus:ring-[#dc2626]/20"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-[#dc2626] text-[10px] font-bold uppercase tracking-widest mt-1">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Phone *</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-300 rounded-xl h-12 font-bold focus:border-[#dc2626] focus:ring-[#dc2626]/20"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <p className="text-[#dc2626] text-[10px] font-bold uppercase tracking-widest mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#fef2f2] rounded-lg flex items-center justify-center">
                <span className="text-[#dc2626] font-black text-xs">02</span>
              </div>
              <h2 className="text-xl font-black text-black uppercase tracking-tight">Billing Address</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Street Address *</label>
                <Input
                  type="text"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleChange}
                  className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-300 rounded-xl h-12 font-bold focus:border-[#dc2626] focus:ring-[#dc2626]/20"
                  placeholder="123 Research Blvd"
                />
                {errors.billingAddress && <p className="text-[#dc2626] text-[10px] font-bold uppercase tracking-widest mt-1">{errors.billingAddress}</p>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="col-span-2 md:col-span-3 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">City *</label>
                  <Input
                    type="text"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleChange}
                    className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-300 rounded-xl h-12 font-bold focus:border-[#dc2626] focus:ring-[#dc2626]/20"
                    placeholder="New York"
                  />
                  {errors.billingCity && <p className="text-[#dc2626] text-[10px] font-bold uppercase tracking-widest mt-1">{errors.billingCity}</p>}
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">State *</label>
                  <Input
                    type="text"
                    name="billingState"
                    value={formData.billingState}
                    onChange={handleChange}
                    className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-300 rounded-xl h-12 font-bold focus:border-[#dc2626] focus:ring-[#dc2626]/20"
                    placeholder="NY"
                  />
                  {errors.billingState && <p className="text-[#dc2626] text-[10px] font-bold uppercase tracking-widest mt-1">{errors.billingState}</p>}
                </div>
                <div className="col-span-1 md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">ZIP *</label>
                  <Input
                    type="text"
                    name="billingZip"
                    value={formData.billingZip}
                    onChange={handleChange}
                    className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-300 rounded-xl h-12 font-bold focus:border-[#dc2626] focus:ring-[#dc2626]/20"
                    placeholder="10001"
                  />
                  {errors.billingZip && <p className="text-[#dc2626] text-[10px] font-bold uppercase tracking-widest mt-1">{errors.billingZip}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Option */}
          <div className="border-t border-slate-100 pt-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#dc2626] rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">03</span>
              </div>
              <h2 className="text-xl font-black text-black uppercase tracking-tight">Shipping Address</h2>
            </div>
            
            <label className="flex items-center gap-3 p-6 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer group hover:border-[#dc2626]/20 transition-all">
              <input
                type="checkbox"
                name="sameAsShipping"
                checked={formData.sameAsShipping}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-300 text-[#dc2626] focus:ring-[#dc2626]/20"
              />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wide group-hover:text-[#dc2626] transition-colors">Same as billing address</span>
            </label>

            {!formData.sameAsShipping && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6 pt-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Address *</label>
                  <Input
                    type="text"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-300 rounded-xl h-12 font-bold focus:border-[#dc2626] focus:ring-[#dc2626]/20"
                    placeholder="456 Shipping Lane"
                  />
                  {errors.shippingAddress && <p className="text-[#dc2626] text-[10px] font-bold uppercase tracking-widest mt-1">{errors.shippingAddress}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">City *</label>
                    <Input
                      type="text"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleChange}
                      className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-300 rounded-xl h-12 font-bold focus:border-[#dc2626] focus:ring-[#dc2626]/20"
                      placeholder="Los Angeles"
                    />
                    {errors.shippingCity && <p className="text-[#dc2626] text-[10px] font-bold uppercase tracking-widest mt-1">{errors.shippingCity}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">State *</label>
                    <Input
                      type="text"
                      name="shippingState"
                      value={formData.shippingState}
                      onChange={handleChange}
                      className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-300 rounded-xl h-12 font-bold focus:border-[#dc2626] focus:ring-[#dc2626]/20"
                      placeholder="CA"
                    />
                    {errors.shippingState && <p className="text-[#dc2626] text-[10px] font-bold uppercase tracking-widest mt-1">{errors.shippingState}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">ZIP Code *</label>
                    <Input
                      type="text"
                      name="shippingZip"
                      value={formData.shippingZip}
                      onChange={handleChange}
                      className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-300 rounded-xl h-12 font-bold focus:border-[#dc2626] focus:ring-[#dc2626]/20"
                      placeholder="90001"
                    />
                    {errors.shippingZip && <p className="text-[#dc2626] text-[10px] font-bold uppercase tracking-widest mt-1">{errors.shippingZip}</p>}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Research Compliance Acknowledgment */}
          {!isFromAccount && (
            <div className="border-t border-slate-100 pt-10">
              <div className="bg-[#dc2626]/5 border-2 border-[#dc2626]/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="researchAck"
                    required
                    className="mt-1 w-5 h-5 rounded border-[#dc2626] text-[#dc2626] focus:ring-[#dc2626]/20"
                  />
                  <label htmlFor="researchAck" className="text-sm font-medium text-slate-700 leading-relaxed">
                   <span className="text-[#dc2626] font-bold">Required: </span> I confirm I am 21+ years old and will use these products for laboratory research purposes only — not for human consumption. These products are not FDA approved.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-6">
            <Button
              onClick={handleContinue}
              className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black py-8 rounded-[24px] text-base shadow-xl shadow-[#dc2626]/20 transition-all flex items-center justify-center gap-3"
            >
              {isFromAccount ? 'Save Changes' : 'Continue to Payment →'}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-center text-sm text-slate-400 font-medium mt-4">
              🔒 Your information is encrypted and secure
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}