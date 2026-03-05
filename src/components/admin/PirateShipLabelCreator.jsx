import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PirateShipLabelCreator({ order, onClose }) {
    const [showPirateShip, setShowPirateShip] = useState(false);
    const [copied, setCopied] = useState({});

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied({ ...copied, [field]: true });
        setTimeout(() => setCopied({ ...copied, [field]: false }), 2000);
    };

    const openPirateShip = () => {
        setShowPirateShip(true);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-h-[95vh] sm:max-h-[90vh] sm:max-w-6xl flex flex-col"
            >
                {/* Header */}
                <div className="border-b border-slate-200 p-3 sm:p-6 flex items-center justify-between flex-shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">Create Shipping Label</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">Order #{order.order_number}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl ml-4 flex-shrink-0">✕</button>
                </div>

                {/* Content: Dual View (Stacked on mobile, side-by-side on desktop) */}
                <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
                    {/* Left: Order Details (Fixed) */}
                    <div className="w-full sm:w-80 border-b sm:border-b-0 sm:border-r border-slate-200 overflow-y-auto p-3 sm:p-6 bg-slate-50">
                        <h3 className="font-bold text-slate-900 mb-4">Order Details</h3>
                        <div className="space-y-4">
                            {/* Shipping Address */}
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Ship To</p>
                                <p className="text-sm font-semibold text-slate-900 mb-1">{order.shipping_address?.address}</p>
                                <p className="text-sm text-slate-600 mb-3">
                                    {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}
                                </p>
                                <button
                                    onClick={() => copyToClipboard(`${order.shipping_address?.address}\n${order.shipping_address?.city}, ${order.shipping_address?.state} ${order.shipping_address?.zip}`, 'address')}
                                    className="text-[11px] font-bold text-[#dc2626] hover:text-red-700 flex items-center gap-1"
                                >
                                    {copied.address ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    Copy Address
                                </button>
                            </div>

                            {/* Items */}
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Items</p>
                                <div className="space-y-2">
                                    {order.items?.map((item, i) => (
                                        <div key={i} className="pb-2 border-b border-slate-100 last:border-b-0 last:pb-0">
                                            <p className="font-semibold text-slate-900 text-sm">{item.productName}</p>
                                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                            <p className="text-xs text-slate-600">${item.price} each</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Order Total</p>
                                <p className="text-2xl font-bold text-blue-900">${order.total_amount}</p>
                            </div>

                            {/* Quick Copy Buttons */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => copyToClipboard(`${order.shipping_address?.city}, ${order.shipping_address?.state} ${order.shipping_address?.zip}`, 'city-state-zip')}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1"
                                >
                                    {copied['city-state-zip'] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    Copy City/State/ZIP
                                </button>
                                <button
                                    onClick={() => copyToClipboard(order.items?.map(i => i.productName).join(', '), 'items')}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1"
                                >
                                    {copied.items ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    Copy Items
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: PirateShip */}
                    <div className="flex-1 overflow-auto p-3 sm:p-6">
                        {!showPirateShip ? (
                            <div className="max-w-2xl">
                                <h4 className="font-bold text-slate-900 mb-4 text-base sm:text-lg">Ready to Create Label?</h4>
                                <p className="text-sm sm:text-base text-slate-600 mb-6">
                                    Click below to open PirateShip in an embedded window. Your order details will stay visible on the left for easy reference while you fill in the shipping information.
                                </p>
                                <Button onClick={openPirateShip} className="w-full">
                                    Open PirateShip Label Creator
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 flex flex-col h-full">
                                <div className="flex items-center justify-between gap-2 flex-shrink-0">
                                    <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">PirateShip Label Creator</h4>
                                    <Button onClick={() => setShowPirateShip(false)} variant="outline" size="sm" className="flex-shrink-0">
                                        Close
                                    </Button>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 mb-2 flex-shrink-0">
                                    Order details are on your left. Copy any info you need and paste it into PirateShip below.
                                </p>
                                <iframe
                                    src="https://pirateship.com"
                                    className="w-full flex-1 border border-slate-300 rounded-lg min-h-[400px] sm:min-h-0"
                                    title="PirateShip"
                                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}