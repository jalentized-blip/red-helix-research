import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { LogOut, Package, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export default function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.filter({ created_by: user?.email }),
    enabled: !!user
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          navigate(createPageUrl('Login'));
          return;
        }
        setUser(currentUser);
      } catch (err) {
        navigate(createPageUrl('Login'));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await base44.auth.logout(createPageUrl('Home'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 pt-32 pb-20 flex items-center justify-center">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-50 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        {/* Account Info */}
        <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-amber-50 mb-2">My Account</h1>
              <p className="text-stone-400">{user.email}</p>
            </div>
            <User className="w-12 h-12 text-red-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <p className="text-stone-400 text-sm mb-1">Full Name</p>
              <p className="text-amber-50 font-semibold">{user.full_name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-stone-400 text-sm mb-1">Account Status</p>
              <p className="text-amber-50 font-semibold capitalize">{user.role}</p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-amber-50 gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Orders Section */}
        <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-black text-amber-50">Recent Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-stone-600 mx-auto mb-4" />
              <p className="text-stone-400 mb-4">No orders yet</p>
              <Link to={createPageUrl('Home')}>
                <Button className="bg-red-600 hover:bg-red-700">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-stone-700 rounded-lg p-4 hover:border-red-600/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-amber-50 font-semibold">Order #{order.order_number}</p>
                      <p className="text-stone-400 text-sm">
                        {new Date(order.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-50 font-black text-lg">${order.total_amount}</p>
                      <p className="text-stone-400 text-sm capitalize">{order.status}</p>
                    </div>
                  </div>
                  <div className="text-stone-400 text-sm">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
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