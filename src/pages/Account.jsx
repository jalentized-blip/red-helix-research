import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { LogOut, User, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Account() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Try to fetch orders if entity exists
        try {
          const userOrders = await base44.entities.Order.filter(
            { created_by: currentUser.email },
            '-created_date',
            50
          );
          setOrders(userOrders);
        } catch {
          setOrders([]);
        }
      } catch {
        window.location.href = createPageUrl('Home');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout(createPageUrl('Home'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-6">
              ← Back to Shop
            </Button>
          </Link>
          <h1 className="text-5xl font-black text-amber-50 mb-3">Account</h1>
        </div>

        {/* Account Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 bg-stone-900/50 border border-stone-700 rounded-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-amber-50 mb-2 flex items-center gap-2">
                  <User className="w-6 h-6 text-red-600" />
                  Account Information
                </h2>
                <p className="text-stone-400">Manage your account details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-stone-800/50 rounded-lg p-4">
                <p className="text-stone-400 text-sm mb-1">Email</p>
                <p className="text-amber-50 font-semibold">{user?.email}</p>
              </div>

              <div className="bg-stone-800/50 rounded-lg p-4">
                <p className="text-stone-400 text-sm mb-1">Full Name</p>
                <p className="text-amber-50 font-semibold">{user?.full_name || 'Not set'}</p>
              </div>

              <div className="bg-stone-800/50 rounded-lg p-4">
                <p className="text-stone-400 text-sm mb-1">Account Status</p>
                <p className="text-green-400 font-semibold">Active</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8">
            <h3 className="text-xl font-bold text-amber-50 mb-4">Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-amber-50 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
              <Link to={createPageUrl('Home')} className="block">
                <Button
                  variant="outline"
                  className="w-full border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-red-600" />
            Order History
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto mb-4" />
              <p className="text-stone-400 mb-4">No orders yet</p>
              <Link to={createPageUrl('Home')}>
                <Button className="bg-red-600 hover:bg-red-700 text-amber-50">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-stone-400 text-sm mb-1">Order ID</p>
                      <p className="text-amber-50 font-semibold text-sm">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-sm mb-1">Date</p>
                      <p className="text-amber-50 font-semibold text-sm">
                        {new Date(order.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-sm mb-1">Status</p>
                      <p className="text-green-400 font-semibold text-sm">Completed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-stone-400 text-sm mb-1">Amount</p>
                      <p className="text-red-600 font-bold text-sm">View Details</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}