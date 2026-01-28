import React, { useState, useEffect } from 'react'
import axios from 'axios'
import QRCode from 'qrcode.react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { parseEther } from 'viem'
import { mainnet } from 'wagmi/chains'

const MERCHANT_ADDRESS = '0xYourRealReceivingWalletHere' // ← VERY IMPORTANT: CHANGE THIS!

const CryptoCheckout = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const order = state?.orderDetails || { amount: 0, orderId: '', items: [] }

  const [tab, setTab] = useState('wallet') // default to new wallet option
  const [ethPrice, setEthPrice] = useState(null)
  const [ethAmount, setEthAmount] = useState(0)
  const [txHash, setTxHash] = useState(null)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('ready') // ready / sending / waiting / success / failed

  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({ address })
  const { switchChainAsync } = useSwitchChain()
  const { sendTransactionAsync } = useSendTransaction()
  const { data: receipt } = useWaitForTransactionReceipt({ hash: txHash })

  // Get live ETH price
  useEffect(() => {
    axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      .then(res => setEthPrice(res.data.ethereum.usd))
      .catch(() => setEthPrice(2400)) // safe fallback
  }, [])

  useEffect(() => {
    if (ethPrice && order.amount > 0) {
      setEthAmount(order.amount / ethPrice)
    }
  }, [ethPrice, order.amount])

  // Auto-detect successful tx
  useEffect(() => {
    if (receipt?.status === 'success') {
      setStatus('success')
      // You can add email/backend call here later
      setTimeout(() => navigate('/payment-success'), 2500)
    }
  }, [receipt, navigate])

  const handleSendPayment = async () => {
    setError(null)
    setStatus('sending')

    try {
      if (!isConnected) throw new Error('Connect your wallet first')

      if (chain?.id !== mainnet.id) {
        await switchChainAsync({ chainId: mainnet.id })
      }

      if (!balance || balance.value < parseEther(ethAmount.toString())) {
        throw new Error('Not enough ETH in your wallet')
      }

      const hash = await sendTransactionAsync({
        to: MERCHANT_ADDRESS,
        value: parseEther(ethAmount.toString()),
      })

      setTxHash(hash)
      setStatus('waiting')
    } catch (err) {
      setError(err.shortMessage || err.message || 'Payment failed — try again')
      setStatus('ready')
    }
  }

  if (order.amount <= 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Invalid Order</h2>
        <p>Go back to your cart and try again.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 text-white rounded-xl shadow-2xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-red-500">Crypto Checkout</h1>
      <p className="text-center text-xl mb-4">Total: <strong>${order.amount.toFixed(2)}</strong> USD</p>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setTab('wallet')}
          className={`px-6 py-3 rounded-lg font-semibold ${tab === 'wallet' ? 'bg-red-700 text-white' : 'bg-gray-700'}`}
        >
          Pay with Wallet
        </button>
        <button
          onClick={() => setTab('coinbase')}
          className={`px-6 py-3 rounded-lg font-semibold ${tab === 'coinbase' ? 'bg-red-700 text-white' : 'bg-gray-700'}`}
        >
          Pay with Coinbase
        </button>
      </div>

      {tab === 'wallet' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Direct Wallet Payment</h2>
          
          {!isConnected ? (
            <div className="text-center">
              <w3m-button size="lg" /> {/* ← The famous "Choose My Wallet" button */}
            </div>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="mb-2">Connected: <span className="font-mono">{address?.slice(0,6)}...{address?.slice(-4)}</span></p>
              <p className="mb-4 text-lg">
                Send ≈ <strong>{ethAmount.toFixed(6)} ETH</strong> (~${order.amount})
              </p>
              {balance && (
                <p className="mb-4">Your balance: <strong>{Number(balance.formatted).toFixed(4)} ETH</strong></p>
              )}

              <button
                onClick={handleSendPayment}
                disabled={status !== 'ready'}
                className={`w-full py-4 text-lg font-bold rounded-lg transition ${
                  status === 'ready' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {status === 'sending' ? 'Sending...' : 
                 status === 'waiting' ? 'Waiting for confirmation...' : 
                 'Send Payment Now'}
              </button>

              {txHash && (
                <p className="mt-4 text-sm text-center break-all">
                  Tx: {txHash}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'coinbase' && (
        <div className="text-center">
          <p className="text-lg mb-4">Coinbase Commerce option coming soon...</p>
          {/* ← Paste your previous Coinbase QR/hosted code here if you still want it */}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-center mt-6 font-semibold">{error}</p>
      )}

      {status === 'success' && (
        <p className="text-green-400 text-center mt-6 text-xl font-bold">
          Payment Successful! Redirecting...
        </p>
      )}
    </div>
  )
}

export default CryptoCheckout
