import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader, Copy, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PirateShipLabelCreator({ order, onClose }) {
    const [pirateShipUrl, setPirateShipUrl] = useState('');
    const [showPirateShip, setShowPirateShip] = useState(false);
    const [labelData, setLabelData] = useState({
        to_zip: order.shipping_address?.zip || '',
        to_state: order.shipping_address?.state || '',
        to_city: order.shipping_address?.city || '',
        to_address: order.shipping_address?.address || '',
        weight: '',
        carrier: 'usps',
        service: ''
    });
    const [rates, setRates] = useState([]);
    const [selectedRate, setSelectedRate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState({});
    const [error, setError] = useState('');

    const autofillFromAI = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Based on this order, estimate the shipping weight and dimensions:
Items: ${order.items?.map(i => `${i.productName} (qty: ${i.quantity})`).join(', ')}

Respond with ONLY a JSON object: {"weight_oz": number, "length_in": number, "width_in": number, "height_in": number}`,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        weight_oz: { type: 'number' },
                        length_in: { type: 'number' },
                        width_in: { type: 'number' },
                        height_in: { type: 'number' }
                    }
                }
            });

            setLabelData(prev => ({
                ...prev,
                weight: (response.weight_oz / 16).toFixed(2) // Convert oz to lbs
            }));
        } catch (err) {
            setError('Failed to estimate dimensions: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getRates = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await base44.functions.invoke('pirateShipAPI', {
                action: 'get_rates',
                labelData: {
                    to_zip: labelData.to_zip,
                    to_state: labelData.to_state,
                    to_country: 'US',
                    weight: labelData.weight
                }
            });

            if (response.data.success) {
                setRates(response.data.rates || []);
            }
        } catch (err) {
            setError('Failed to fetch rates: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied({ ...copied, [field]: true });
        setTimeout(() => setCopied({ ...copied, [field]: false }), 2000);
    };

    const loginToPirateShip = () => {
        const pirateShipAuthUrl = `https://pirateship.com/oauth/authorize?client_id=${Deno.env.get('PIRATESHIP_CLIENT_ID')}&redirect_uri=${window.location.origin}/pirateship-callback&response_type=code&scope=read%20write`;
        setPirateShipUrl(pirateShipAuthUrl);
        setShowPirateShip(true);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="border-b border-slate-200 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Create Shipping Label</h2>
                        <p className="text-sm text-slate-500 mt-1">Order #{order.order_number}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left: Order Details */}
                    <div className="w-1/3 border-r border-slate-200 overflow-y-auto p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Order Details</h3>
                        <div className="space-y-4">
                            {/* Shipping Address */}
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Ship To</p>
                                <p className="text-sm font-semibold text-slate-900 mb-1">
                                    {order.shipping_address?.address}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}
                                </p>
                                <button
                                    onClick={() => copyToClipboard(`${order.shipping_address?.address}\n${order.shipping_address?.city}, ${order.shipping_address?.state} ${order.shipping_address?.zip}`, 'address')}
                                    className="mt-3 text-[11px] font-bold text-[#dc2626] hover:text-red-700 flex items-center gap-1"
                                >
                                    {copied.address ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    Copy Address
                                </button>
                            </div>

                            {/* Items */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Items</p>
                                <div className="space-y-2">
                                    {order.items?.map((item, i) => (
                                        <div key={i} className="text-sm text-slate-700">
                                            <p className="font-semibold">{item.productName}</p>
                                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Label Creator or PirateShip */}
                    <div className="w-2/3 overflow-y-auto p-6">
                        {!showPirateShip ? (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-4">Shipping Details</h4>

                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {/* Weight & Dimensions */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                Weight (lbs)
                                            </label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="e.g., 2.5"
                                                    value={labelData.weight}
                                                    onChange={(e) => setLabelData({ ...labelData, weight: e.target.value })}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    onClick={autofillFromAI}
                                                    disabled={loading}
                                                    variant="outline"
                                                    className="whitespace-nowrap"
                                                >
                                                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'AI Estimate'}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Carrier */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                Carrier
                                            </label>
                                            <Select value={labelData.carrier} onValueChange={(v) => setLabelData({ ...labelData, carrier: v })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="usps">USPS</SelectItem>
                                                    <SelectItem value="ups">UPS</SelectItem>
                                                    <SelectItem value="fedex">FedEx</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Get Rates Button */}
                                        <Button
                                            onClick={getRates}
                                            disabled={loading || !labelData.weight || !labelData.to_zip}
                                            className="w-full"
                                        >
                                            {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Get Shipping Rates
                                        </Button>
                                    </div>
                                </div>

                                {/* Rates */}
                                {rates.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-3">Available Rates</h4>
                                        <div className="space-y-2">
                                            {rates.map((rate, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedRate(rate)}
                                                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                                                        selectedRate?.id === rate.id
                                                            ? 'border-[#dc2626] bg-red-50'
                                                            : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <p className="font-semibold text-slate-900">{rate.service}</p>
                                                    <p className="text-sm text-slate-600">${rate.rate}</p>
                                                </button>
                                            ))}
                                        </div>

                                        {selectedRate && (
                                            <Button
                                                onClick={() => setShowPirateShip(true)}
                                                className="w-full mt-4"
                                            >
                                                Continue to PirateShip
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {rates.length === 0 && !loading && (
                                    <Button
                                        onClick={loginToPirateShip}
                                        className="w-full"
                                    >
                                        Sign In to PirateShip
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div>
                                <h4 className="font-bold text-slate-900 mb-4">PirateShip Label Creator</h4>
                                <p className="text-sm text-slate-600 mb-4">
                                    A new window will open. Complete your label creation there. The order details remain visible on the left for easy reference.
                                </p>
                                <iframe
                                    src={pirateShipUrl}
                                    className="w-full h-96 border border-slate-200 rounded-lg"
                                    title="PirateShip"
                                />
                                <Button
                                    onClick={() => setShowPirateShip(false)}
                                    variant="outline"
                                    className="w-full mt-4"
                                >
                                    Back to Details
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}