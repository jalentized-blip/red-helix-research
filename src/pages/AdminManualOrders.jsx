import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Search, Loader2, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminManualOrders() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState('transaction');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Manual order form
  const [orderForm, setOrderForm] = useState({
    customerEmail: '',
    customerName: '',
    transactionId: '',
    cryptoCurrency: 'BTC',
    cryptoAmount: '',
    totalAmount: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    items: []
  });

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        window.location.href = createPageUrl('Home');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setSearching(true);
    setSearchResults(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: searchType === 'transaction'
          ? `Search for cryptocurrency transaction "${searchQuery}" on major blockchains (BTC, ETH, USDT, USDC). Return transaction details in JSON format with: "found" (boolean), "transactionId" (string), "blockchain" (string), "amount" (number), "currency" (string), "fromAddress" (string), "toAddress" (string), "confirmations" (number), "timestamp" (string), "error" (string or null).`
          : `Search for cryptocurrency transactions from wallet address "${searchQuery}" in the last 7 days on major blockchains. Return the most recent transaction in JSON format with: "found" (boolean), "transactionId" (string), "blockchain" (string), "amount" (number), "currency" (string), "fromAddress" (string), "toAddress" (string), "confirmations" (number), "timestamp" (string), "error" (string or null).`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            found: { type: 'boolean' },
            transactionId: { type: ['string', 'null'] },
            blockchain: { type: ['string', 'null'] },
            amount: { type: ['number', 'null'] },
            currency: { type: ['string', 'null'] },
            fromAddress: { type: ['string', 'null'] },
            toAddress: { type: ['string', 'null'] },
            confirmations: { type: ['number', 'null'] },
            timestamp: { type: ['string', 'null'] },
            error: { type: ['string', 'null'] }
          },
          required: ['found', 'transactionId', 'error']
        }
      });

      setSearchResults(result);

      if (result.found && result.transactionId) {
        // Pre-fill the order form
        setOrderForm(prev => ({
          ...prev,
          transactionId: result.transactionId,
          cryptoCurrency: result.currency || 'BTC',
          cryptoAmount: result.amount?.toString() || ''
        }));
        toast.success('Transaction found! Review details below.');
      } else {
        toast.error(result.error || 'Transaction not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!orderForm.customerEmail || !orderForm.transactionId || !orderForm.totalAmount) {
      toast.error('Please fill in customer email, transaction ID, and total amount');
      return;
    }

    setCreatingOrder(true);

    try {
      const orderNumber = `ORD-MANUAL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const order = await base44.entities.Order.create({
        order_number: orderNumber,
        customer_email: orderForm.customerEmail,
        customer_name: orderForm.customerName || 'Manual Entry',
        items: orderForm.items.length > 0 ? orderForm.items : [{ productName: 'Manual Entry', specification: 'N/A', quantity: 1, price: parseFloat(orderForm.totalAmount) }],
        subtotal: parseFloat(orderForm.totalAmount),
        discount_amount: 0,
        shipping_cost: 0,
        total_amount: parseFloat(orderForm.totalAmount),
        payment_method: 'cryptocurrency',
        payment_status: 'completed',
        transaction_id: orderForm.transactionId,
        crypto_currency: orderForm.cryptoCurrency,
        crypto_amount: orderForm.cryptoAmount,
        status: 'processing',
        shipping_address: orderForm.shippingAddress ? {
          firstName: orderForm.customerName.split(' ')[0] || '',
          lastName: orderForm.customerName.split(' ')[1] || '',
          shippingAddress: orderForm.shippingAddress,
          shippingCity: orderForm.shippingCity,
          shippingState: orderForm.shippingState,
          shippingZip: orderForm.shippingZip
        } : null,
        created_by: orderForm.customerEmail
      });

      // Send confirmation email
      if (orderForm.customerEmail) {
        await base44.integrations.Core.SendEmail({
          from_name: 'Red Helix Research',
          to: orderForm.customerEmail,
          subject: `Order Confirmation - ${orderNumber}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #8B2635;">Order Confirmed!</h2>
              <p>Hi ${orderForm.customerName || 'Valued Customer'},</p>
              <p>Your payment has been verified and your order has been confirmed.</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Order #${orderNumber}</h3>
                <p><strong>Transaction ID:</strong> ${orderForm.transactionId}</p>
                <p><strong>Amount:</strong> $${orderForm.totalAmount}</p>
                <p><strong>Status:</strong> Processing</p>
              </div>

              <p>You will receive tracking information once your order ships.</p>
              <p>Questions? Contact us at <a href="mailto:reddirtresearch@gmail.com">reddirtresearch@gmail.com</a></p>
            </div>
          `
        });
      }

      // Get all admin users and notify them
      const allUsers = await base44.entities.User.list();
      const admins = allUsers.filter(u => u.role === 'admin');

      for (const admin of admins) {
        await base44.entities.Notification.create({
          type: 'manual_order_created',
          admin_email: admin.email,
          customer_name: orderForm.customerName || 'Manual Entry',
          customer_email: orderForm.customerEmail,
          order_id: order.id,
          order_number: orderNumber,
          total_amount: parseFloat(orderForm.totalAmount),
          crypto_currency: orderForm.cryptoCurrency,
          transaction_id: orderForm.transactionId,
          message_preview: `Manual order created: ${orderNumber} ($${orderForm.totalAmount})`,
          read: false
        });
      }

      toast.success('Order created successfully!');
      
      // Reset form
      setOrderForm({
        customerEmail: '',
        customerName: '',
        transactionId: '',
        cryptoCurrency: 'BTC',
        cryptoAmount: '',
        totalAmount: '',
        shippingAddress: '',
        shippingCity: '',
        shippingState: '',
        shippingZip: '',
        items: []
      });
      setSearchResults(null);
      setSearchQuery('');
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order: ' + error.message);
    } finally {
      setCreatingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-amber-50 mb-2">Manual Order Creation</h1>
          <p className="text-stone-400">Search for transactions and manually create orders when automated verification fails</p>
        </div>

        {/* Search Section */}
        <Card className="bg-stone-900/50 border-stone-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-amber-50 mb-4">Search Blockchain Transaction</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-sm font-semibold text-stone-300 block mb-2">Search Type</label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="bg-stone-800 border-stone-700 text-amber-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-stone-700">
                    <SelectItem value="transaction" className="text-amber-50">Transaction ID</SelectItem>
                    <SelectItem value="wallet" className="text-amber-50">Wallet Address</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-stone-300 block mb-2">
                  {searchType === 'transaction' ? 'Transaction ID' : 'Wallet Address'}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchType === 'transaction' ? 'Enter transaction ID' : 'Enter wallet address'}
                    className="bg-stone-800 border-stone-700 text-amber-50 font-mono"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={searching || !searchQuery.trim()}
                    className="bg-blue-700 hover:bg-blue-600"
                  >
                    {searching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {searchResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg p-4 border ${
                  searchResults.found
                    ? 'bg-green-900/20 border-green-700/50'
                    : 'bg-red-900/20 border-red-700/50'
                }`}
              >
                {searchResults.found ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-400 font-semibold mb-3">
                      <CheckCircle className="w-5 h-5" />
                      Transaction Found
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-stone-400">Transaction ID</p>
                        <p className="text-amber-50 font-mono text-xs break-all">{searchResults.transactionId}</p>
                      </div>
                      <div>
                        <p className="text-stone-400">Blockchain</p>
                        <p className="text-amber-50">{searchResults.blockchain || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-stone-400">Amount</p>
                        <p className="text-amber-50">{searchResults.amount} {searchResults.currency}</p>
                      </div>
                      <div>
                        <p className="text-stone-400">Confirmations</p>
                        <p className="text-amber-50">{searchResults.confirmations || 'N/A'}</p>
                      </div>
                      {searchResults.fromAddress && (
                        <div className="col-span-2">
                          <p className="text-stone-400">From Address</p>
                          <p className="text-amber-50 font-mono text-xs break-all">{searchResults.fromAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    {searchResults.error || 'Transaction not found'}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </Card>

        {/* Manual Order Form */}
        <Card className="bg-stone-900/50 border-stone-700 p-6">
          <h2 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Create Manual Order
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-stone-300 block mb-2">Customer Email *</label>
                <Input
                  value={orderForm.customerEmail}
                  onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                  placeholder="customer@example.com"
                  className="bg-stone-800 border-stone-700 text-amber-50"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-stone-300 block mb-2">Customer Name</label>
                <Input
                  value={orderForm.customerName}
                  onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                  placeholder="John Doe"
                  className="bg-stone-800 border-stone-700 text-amber-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-stone-300 block mb-2">Transaction ID *</label>
                <Input
                  value={orderForm.transactionId}
                  onChange={(e) => setOrderForm({ ...orderForm, transactionId: e.target.value })}
                  placeholder="0x..."
                  className="bg-stone-800 border-stone-700 text-amber-50 font-mono"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-stone-300 block mb-2">Cryptocurrency</label>
                <Select value={orderForm.cryptoCurrency} onValueChange={(value) => setOrderForm({ ...orderForm, cryptoCurrency: value })}>
                  <SelectTrigger className="bg-stone-800 border-stone-700 text-amber-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-stone-700">
                    <SelectItem value="BTC" className="text-amber-50">BTC</SelectItem>
                    <SelectItem value="ETH" className="text-amber-50">ETH</SelectItem>
                    <SelectItem value="USDT" className="text-amber-50">USDT</SelectItem>
                    <SelectItem value="USDC" className="text-amber-50">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-stone-300 block mb-2">Crypto Amount</label>
                <Input
                  value={orderForm.cryptoAmount}
                  onChange={(e) => setOrderForm({ ...orderForm, cryptoAmount: e.target.value })}
                  placeholder="0.001"
                  type="number"
                  step="any"
                  className="bg-stone-800 border-stone-700 text-amber-50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-stone-300 block mb-2">Total Amount (USD) *</label>
              <Input
                value={orderForm.totalAmount}
                onChange={(e) => setOrderForm({ ...orderForm, totalAmount: e.target.value })}
                placeholder="100.00"
                type="number"
                step="0.01"
                className="bg-stone-800 border-stone-700 text-amber-50"
              />
            </div>

            <div className="border-t border-stone-700 pt-4">
              <h3 className="text-sm font-semibold text-stone-300 mb-3">Shipping Address (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    value={orderForm.shippingAddress}
                    onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                    placeholder="Street Address"
                    className="bg-stone-800 border-stone-700 text-amber-50"
                  />
                </div>
                <div>
                  <Input
                    value={orderForm.shippingCity}
                    onChange={(e) => setOrderForm({ ...orderForm, shippingCity: e.target.value })}
                    placeholder="City"
                    className="bg-stone-800 border-stone-700 text-amber-50"
                  />
                </div>
                <div>
                  <Input
                    value={orderForm.shippingState}
                    onChange={(e) => setOrderForm({ ...orderForm, shippingState: e.target.value })}
                    placeholder="State"
                    className="bg-stone-800 border-stone-700 text-amber-50"
                  />
                </div>
                <div>
                  <Input
                    value={orderForm.shippingZip}
                    onChange={(e) => setOrderForm({ ...orderForm, shippingZip: e.target.value })}
                    placeholder="ZIP Code"
                    className="bg-stone-800 border-stone-700 text-amber-50"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreateOrder}
              disabled={creatingOrder || !orderForm.customerEmail || !orderForm.transactionId || !orderForm.totalAmount}
              className="w-full bg-green-700 hover:bg-green-600 text-amber-50 font-semibold"
            >
              {creatingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Order...
                </>
              ) : (
                'Create Order'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}