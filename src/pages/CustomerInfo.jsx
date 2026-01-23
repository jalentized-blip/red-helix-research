import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

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

  const handleContinue = () => {
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
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
    navigate(createPageUrl('CryptoCheckout'));
  };

  const shippingData = formData.sameAsShipping ? 
    { city: formData.billingCity, state: formData.billingState, zip: formData.billingZip, address: formData.billingAddress } :
    { city: formData.shippingCity, state: formData.shippingState, zip: formData.shippingZip, address: formData.shippingAddress };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Cart')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="text-4xl font-black text-amber-50">Billing & Shipping</h1>
          <p className="text-stone-400 mt-2">Complete your information before checkout</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stone-900/50 border border-stone-700 rounded-lg p-8 space-y-6"
        >
          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-bold text-amber-50 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-stone-300 block mb-2">First Name *</label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                  placeholder="John"
                />
                {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-stone-300 block mb-2">Last Name *</label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-stone-300 block mb-2">Email *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-stone-300 block mb-2">Phone *</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="border-t border-stone-700 pt-6">
            <h2 className="text-xl font-bold text-amber-50 mb-4">Billing Address</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-stone-300 block mb-2">Address *</label>
                <Input
                  type="text"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleChange}
                  className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                  placeholder="123 Main Street"
                />
                {errors.billingAddress && <p className="text-red-600 text-xs mt-1">{errors.billingAddress}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-stone-300 block mb-2">City *</label>
                  <Input
                    type="text"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleChange}
                    className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                    placeholder="New York"
                  />
                  {errors.billingCity && <p className="text-red-600 text-xs mt-1">{errors.billingCity}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-stone-300 block mb-2">State *</label>
                  <Input
                    type="text"
                    name="billingState"
                    value={formData.billingState}
                    onChange={handleChange}
                    className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                    placeholder="NY"
                    maxLength="2"
                  />
                  {errors.billingState && <p className="text-red-600 text-xs mt-1">{errors.billingState}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-stone-300 block mb-2">ZIP Code *</label>
                  <Input
                    type="text"
                    name="billingZip"
                    value={formData.billingZip}
                    onChange={handleChange}
                    className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                    placeholder="10001"
                  />
                  {errors.billingZip && <p className="text-red-600 text-xs mt-1">{errors.billingZip}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address Toggle */}
          <div className="border-t border-stone-700 pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="sameAsShipping"
                checked={formData.sameAsShipping}
                onChange={handleChange}
                className="w-4 h-4 rounded accent-red-600"
              />
              <span className="text-sm font-semibold text-stone-300">Shipping address same as billing</span>
            </label>
          </div>

          {/* Shipping Address */}
          {!formData.sameAsShipping && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-stone-700 pt-6"
            >
              <h2 className="text-xl font-bold text-amber-50 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-stone-300 block mb-2">Address *</label>
                  <Input
                    type="text"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                    placeholder="123 Main Street"
                  />
                  {errors.shippingAddress && <p className="text-red-600 text-xs mt-1">{errors.shippingAddress}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-stone-300 block mb-2">City *</label>
                    <Input
                      type="text"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleChange}
                      className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                      placeholder="New York"
                    />
                    {errors.shippingCity && <p className="text-red-600 text-xs mt-1">{errors.shippingCity}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-300 block mb-2">State *</label>
                    <Input
                      type="text"
                      name="shippingState"
                      value={formData.shippingState}
                      onChange={handleChange}
                      className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                      placeholder="NY"
                      maxLength="2"
                    />
                    {errors.shippingState && <p className="text-red-600 text-xs mt-1">{errors.shippingState}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-300 block mb-2">ZIP Code *</label>
                    <Input
                      type="text"
                      name="shippingZip"
                      value={formData.shippingZip}
                      onChange={handleChange}
                      className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                      placeholder="10001"
                    />
                    {errors.shippingZip && <p className="text-red-600 text-xs mt-1">{errors.shippingZip}</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Address Summary */}
          <div className="border-t border-stone-700 pt-6 bg-stone-800/30 rounded-lg p-4">
            <h3 className="text-sm font-bold text-amber-50 mb-3">Address Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-300">
              <div>
                <p className="font-semibold text-stone-400 mb-1">Billing</p>
                <p>{formData.firstName} {formData.lastName}</p>
                <p>{formData.billingAddress}</p>
                <p>{formData.billingCity}, {formData.billingState} {formData.billingZip}</p>
              </div>
              <div>
                <p className="font-semibold text-stone-400 mb-1">Shipping</p>
                <p>{formData.firstName} {formData.lastName}</p>
                <p>{shippingData.address}</p>
                <p>{shippingData.city}, {shippingData.state} {shippingData.zip}</p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="border-t border-stone-700 pt-6 flex gap-3">
            <Link to={createPageUrl('Cart')} className="flex-1">
              <Button variant="outline" className="w-full border-stone-700 text-stone-300 hover:text-amber-50">
                Back
              </Button>
            </Link>
            <Button
              onClick={handleContinue}
              className="flex-1 bg-red-700 hover:bg-red-600 text-amber-50 font-semibold gap-2"
            >
              Continue to Checkout
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}