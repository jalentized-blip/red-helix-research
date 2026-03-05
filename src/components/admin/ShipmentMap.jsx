import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { base44 } from '@/api/base44Client';
import { Loader2, MapPin, Truck, Package } from 'lucide-react';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';

// Simple US city/state → approximate lat/lng lookup for common destinations
// Falls back to LLM geocoding for unknown locations
const US_STATE_CENTERS = {
  AL: [32.8, -86.8], AK: [64.2, -153.4], AZ: [34.3, -111.1], AR: [34.8, -92.2],
  CA: [36.8, -119.4], CO: [39.1, -105.4], CT: [41.6, -72.7], DE: [39.0, -75.5],
  FL: [27.8, -81.6], GA: [32.2, -83.4], HI: [19.9, -155.6], ID: [44.4, -114.5],
  IL: [40.0, -89.2], IN: [40.3, -86.1], IA: [42.0, -93.2], KS: [38.5, -98.4],
  KY: [37.5, -85.3], LA: [31.2, -91.8], ME: [45.4, -69.0], MD: [39.0, -76.8],
  MA: [42.2, -71.5], MI: [43.3, -84.5], MN: [46.4, -93.1], MS: [32.7, -89.7],
  MO: [38.5, -92.5], MT: [47.0, -110.5], NE: [41.5, -99.9], NV: [39.5, -116.8],
  NH: [43.7, -71.6], NJ: [40.1, -74.5], NM: [34.5, -106.2], NY: [42.8, -75.5],
  NC: [35.6, -79.8], ND: [47.5, -100.5], OH: [40.4, -82.8], OK: [35.6, -96.9],
  OR: [44.6, -122.1], PA: [41.2, -77.2], RI: [41.7, -71.5], SC: [33.9, -80.9],
  SD: [44.4, -100.2], TN: [35.9, -86.7], TX: [31.5, -99.3], UT: [39.4, -111.1],
  VT: [44.0, -72.7], VA: [37.8, -78.2], WA: [47.5, -120.7], WV: [38.5, -80.7],
  WI: [44.3, -89.8], WY: [42.8, -107.6], DC: [38.9, -77.0],
};

function getApproxCoords(addr) {
  if (!addr) return null;
  const state = addr.state?.trim().toUpperCase();
  if (state && US_STATE_CENTERS[state]) {
    // Jitter slightly so markers don't stack
    const [lat, lng] = US_STATE_CENTERS[state];
    return [lat + (Math.random() - 0.5) * 2, lng + (Math.random() - 0.5) * 2];
  }
  return null;
}

export default function ShipmentMap({ orders }) {
  const [geocoded, setGeocoded] = useState([]);
  const [loading, setLoading] = useState(true);
  const geocodeCache = useRef({});

  const shippedOrders = orders.filter(o => o.status === 'shipped' && o.tracking_number);

  useEffect(() => {
    if (!shippedOrders.length) { setLoading(false); return; }

    const geocodeAll = async () => {
      setLoading(true);
      const results = [];

      for (const order of shippedOrders) {
        const addr = order.shipping_address || {};
        const cacheKey = `${addr.city},${addr.state},${addr.zip}`;

        let coords = geocodeCache.current[cacheKey];

        if (!coords) {
          // Try quick lookup first
          coords = getApproxCoords(addr);

          // If not found and we have a city, try LLM geocoding
          if (!coords && (addr.city || addr.zip)) {
            try {
              const locationStr = [addr.city, addr.state, addr.zip, addr.country || 'USA'].filter(Boolean).join(', ');
              const res = await base44.integrations.Core.InvokeLLM({
                prompt: `Return the latitude and longitude for: "${locationStr}". Only return JSON.`,
                response_json_schema: {
                  type: 'object',
                  properties: { lat: { type: 'number' }, lng: { type: 'number' } },
                },
              });
              if (res?.lat && res?.lng) {
                coords = [res.lat, res.lng];
              }
            } catch (_) {
              // silently skip
            }
          }

          if (coords) geocodeCache.current[cacheKey] = coords;
        }

        if (coords) {
          results.push({ order, coords });
        }
      }

      setGeocoded(results);
      setLoading(false);
    };

    geocodeAll();
  }, [shippedOrders.length]);

  if (!shippedOrders.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <Truck className="w-10 h-10 text-slate-200 mb-3" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No shipped orders to map</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-3xl border border-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-[#dc2626] mb-3" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Locating shipments...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden border-2 border-slate-200 shadow-sm">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Active Shipments Map</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
            <span className="text-slate-500">{geocoded.length} plotted</span>
          </span>
          {shippedOrders.length - geocoded.length > 0 && (
            <span className="text-slate-400">({shippedOrders.length - geocoded.length} no address)</span>
          )}
        </div>
      </div>

      {geocoded.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-50">
          <Package className="w-10 h-10 text-slate-200 mb-3" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs text-center px-4">
            No address data available to map.<br />Add shipping addresses to orders to see them here.
          </p>
        </div>
      ) : (
        <MapContainer
          center={[39.5, -98.4]}
          zoom={4}
          style={{ height: '420px', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geocoded.map(({ order, coords }) => (
            <CircleMarker
              key={order.id}
              center={coords}
              radius={10}
              pathOptions={{
                color: '#7c3aed',
                fillColor: '#a855f7',
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <p className="font-black text-slate-900 mb-0.5">#{order.order_number}</p>
                  <p className="text-purple-600 font-bold text-xs mb-1">{order.carrier} — {order.tracking_number}</p>
                  {order.customer_name && <p className="text-slate-600 text-xs">👤 {order.customer_name}</p>}
                  {order.shipping_address?.city && (
                    <p className="text-slate-500 text-xs">
                      📍 {[order.shipping_address.city, order.shipping_address.state, order.shipping_address.zip].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {order.estimated_delivery && (
                    <p className="text-blue-500 text-xs mt-1">
                      🕐 Est. {format(new Date(order.estimated_delivery), 'MMM d, yyyy')}
                    </p>
                  )}
                  <p className="text-[#dc2626] font-black text-xs mt-1">${order.total_amount?.toFixed(2)}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}