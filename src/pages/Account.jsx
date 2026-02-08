import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { LogOut, Package, User, Settings, Home, LayoutDashboard, Heart, TrendingUp, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import DashboardStats from '@/components/account/DashboardStats';
import FavoritePeptides from '@/components/account/FavoritePeptides';
import RecommendedPeptides from '@/components/account/RecommendedPeptides';
import RecentActivity from '@/components/account/RecentActivity';
import QuickCategories from '@/components/account/QuickCategories';
import OrderTrackingDetails from '@/components/account/OrderTrackingDetails';

export default function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.filter({ created_by: user?.email }),
    enabled: !!user
  });

  const { data: preferences, refetch: refetchPreferences } = useQuery({
    queryKey: ['userPreferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreference.filter({ created_by: user?.email });
      if (prefs.length === 0) {
        const newPref = await base44.entities.UserPreference.create({
          favorite_products: [],
          viewed_products: [],
          preferred_categories: [],
          search_history: []
        });
        return newPref;
      }
      return prefs[0];
    },
    enabled: !!user
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          navigate(createPageUrl('Login') + '?returnUrl=' + encodeURIComponent(createPageUrl('Account')));
          return;
        }
        setUser(currentUser);
      } catch (err) {
        // Redirect to our custom login page
        navigate(createPageUrl('Login') + '?returnUrl=' + encodeURIComponent(createPageUrl('Account')));
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleRemoveFavorite = async (productId) => {
    if (!preferences) return;
    const updatedFavorites = preferences.favorite_products.filter(id => id !== productId);
    await base44.entities.UserPreference.update(preferences.id, {
      favorite_products: updatedFavorites
    });
    refetchPreferences();
  };

  const handleLogout = () => {
    // ✅ FIXED: Let Base44 SDK handle logout properly
    // Do NOT clear localStorage/sessionStorage - the SDK manages token cleanup internally
    // Clearing storage before logout breaks the SDK's ability to properly clean up
    // and removes important app configuration like appId
    base44.auth.logout(createPageUrl('Home'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-400 hover:text-red-600 mb-8 transition-colors">
          <Home className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 sticky top-24 shadow-sm"
            >
              <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-600/20">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-slate-900 font-black text-lg tracking-tighter uppercase">{user.full_name || 'User'}</h3>
                <p className="text-slate-500 text-xs mt-1 font-medium">{user.email}</p>
              </div>

              <nav className="space-y-2 mb-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-slate-500 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'favorites'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-slate-500 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Favorites</span>
                  {preferences?.favorite_products?.length > 0 && (
                    <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${
                      activeTab === 'favorites' ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {preferences.favorite_products.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'recommendations'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-slate-500 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Recommended</span>
                </button>

                <button
                  onClick={() => setActiveTab('activity')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'activity'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-slate-500 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Activity</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'orders'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-slate-500 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Orders</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'settings'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-slate-500 hover:text-red-600 hover:bg-white'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Settings</span>
                </button>
              </nav>

              <Button
                onClick={handleLogout}
                className="w-full bg-slate-900 hover:bg-red-600 text-white gap-2 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-xs py-6"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Research Dashboard</h2>
                    <DashboardStats preferences={preferences} orders={orders} />
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Quick Access Categories</h2>
                    <QuickCategories preferences={preferences} />
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Recommended For You</h2>
                    <RecommendedPeptides preferences={preferences} orders={orders} />
                  </div>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter uppercase">My Favorite Peptides</h2>
                  <FavoritePeptides preferences={preferences} onRemoveFavorite={handleRemoveFavorite} />
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Recommended For You</h2>
                  <p className="text-slate-500 text-sm mb-6 font-medium">Based on your browsing history and research interests</p>
                  <RecommendedPeptides preferences={preferences} orders={orders} />
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Recent Activity</h2>
                  <RecentActivity preferences={preferences} />
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Order History</h2>

                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-500 mb-6 text-lg font-medium">No orders yet</p>
                      <Link to={createPageUrl('Home')}>
                        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs px-8 py-6">
                          Start Shopping
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order, idx) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white border border-slate-100 rounded-3xl p-6 hover:border-red-600/30 hover:shadow-lg transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <p className="text-slate-900 font-black text-lg tracking-tighter uppercase">Order #{order.order_number}</p>
                              <p className="text-slate-500 text-xs mt-1 font-medium">
                                Placed {new Date(order.created_date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>

                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                              <div className="text-right">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total</p>
                                <p className="text-slate-900 font-black text-xl tracking-tighter">${order.total_amount.toFixed(2)}</p>
                              </div>
                              <div className="h-px w-full md:w-px md:h-8 bg-slate-100"></div>
                              <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                                <p className="text-slate-900 font-bold capitalize">
                                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {order.status}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {order.items && order.items.length > 0 && (
                           <div className="mt-4 pt-4 border-t border-slate-100">
                             <p className="text-xs text-slate-500 mb-3 font-medium">
                               {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                             </p>

                             {/* Real-time Tracking Information */}
                             <OrderTrackingDetails order={order} />

                             {/* Resend Confirmation Email */}
                             <button
                               onClick={async () => {
                                 try {
                                   const orderItemsList = order.items.map(item => {
                                     const name = item.product_name || item.productName;
                                     const price = (item.price * item.quantity).toFixed(2);
                                     return '<li>' + name + ' (' + item.specification + ') x' + item.quantity + ' - $' + price + '</li>';
                                   }).join('');

                                   let paymentInfo = '';
                                   if (order.crypto_amount && order.crypto_currency) {
                                     paymentInfo = '<p><strong>Payment:</strong> ' + order.crypto_amount + ' ' + order.crypto_currency + '</p>';
                                   }
                                   if (order.transaction_id) {
                                     paymentInfo += '<p><strong>Transaction ID:</strong> ' + order.transaction_id + '</p>';
                                   }

                                   let trackingInfo = '';
                                   if (order.tracking_number) {
                                     trackingInfo = '<p><strong>Tracking Number:</strong> ' + order.tracking_number + '</p>';
                                     trackingInfo += '<p><strong>Carrier:</strong> ' + (order.carrier || 'N/A') + '</p>';
                                     if (order.estimated_delivery) {
                                       trackingInfo += '<p><strong>Est. Delivery:</strong> ' + new Date(order.estimated_delivery).toLocaleDateString() + '</p>';
                                     }
                                   }

                                   let shippingInfo = '';
                                   if (order.shipping_address) {
                                     const addr = order.shipping_address;
                                     shippingInfo = '<h3>Shipping Address:</h3><p>' + order.customer_name + '<br>' + 
                                       (addr.address || addr.shippingAddress) + '<br>' +
                                       (addr.city || addr.shippingCity) + ', ' + (addr.state || addr.shippingState) + ' ' + (addr.zip || addr.shippingZip) + '</p>';
                                   }

                                   const emailBody = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
                                     '<h2 style="color: #8B2635;">Thank You for Your Order!</h2>' +
                                     '<p>Hi ' + (order.customer_name || 'Customer') + ',</p>' +
                                     '<p>We\'ve received your order and it\'s being processed.</p>' +
                                     '<div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">' +
                                       '<h3 style="margin-top: 0;">Order #' + order.order_number + '</h3>' +
                                       paymentInfo +
                                       '<p><strong>Total:</strong> $' + order.total_amount.toFixed(2) + ' USD</p>' +
                                       '<p><strong>Status:</strong> ' + order.status + '</p>' +
                                       trackingInfo +
                                     '</div>' +
                                     '<h3>Order Items:</h3>' +
                                     '<ul>' + orderItemsList + '</ul>' +
                                     shippingInfo +
                                     '<p style="margin-top: 20px;">You will receive tracking information once your order ships.</p>' +
                                     '</div>';

                                   await base44.integrations.Core.SendEmail({
                                     from_name: 'Red Helix Research',
                                     to: order.customer_email,
                                     subject: 'Order Confirmation - ' + order.order_number,
                                     body: emailBody
                                   });
                                   alert('Confirmation email resent!');
                                 } catch (error) {
                                   console.error('Failed to resend email:', error);
                                   alert('Failed to resend email. Please contact support.');
                                 }
                               }}
                               className="text-[10px] font-black uppercase tracking-tighter text-red-600 hover:text-red-500 underline transition-colors"
                             >
                               Resend Confirmation Email
                             </button>
                           </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8">
                  <h2 className="text-2xl font-black text-amber-50 mb-6">Account Settings</h2>

                  <div className="space-y-6">
                    <div className="pb-6 border-b border-stone-700">
                      <p className="text-stone-400 text-sm uppercase tracking-wide mb-2">Full Name</p>
                      <p className="text-amber-50 text-lg font-semibold">{user.full_name || 'Not set'}</p>
                    </div>

                    <div className="pb-6 border-b border-stone-700">
                      <p className="text-stone-400 text-sm uppercase tracking-wide mb-2">Email Address</p>
                      <p className="text-amber-50 text-lg font-semibold">{user.email}</p>
                    </div>

                    <div className="pb-6">
                      <p className="text-stone-400 text-sm uppercase tracking-wide mb-2">Account Type</p>
                      <p className="text-amber-50 text-lg font-semibold capitalize">{user.role}</p>
                    </div>

                    <div className="bg-stone-800/50 border border-stone-700 rounded-lg p-4 mt-8">
                      <p className="text-stone-400 text-sm mb-4">Need to update your information?</p>
                      <p className="text-stone-500 text-xs">Contact support at support@redditresearch.com</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}