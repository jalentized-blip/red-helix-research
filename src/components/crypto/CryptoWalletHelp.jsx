import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function CryptoWalletHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const sections = [
    {
      id: 'wallet-setup',
      title: 'Getting Started with a Crypto Wallet',
      content: [
        {
          step: '1. Choose a Wallet',
          description: 'Download a reputable wallet app like MetaMask, Trust Wallet, or Ledger Live on your phone or computer. Make sure to download from official sources only.',
        },
        {
          step: '2. Create Your Account',
          description: 'Open the wallet and create a new account. You\'ll be given a seed phrase (12-24 words) - SAVE THIS SAFELY. This is the master key to your wallet. Never share it with anyone.',
        },
        {
          step: '3. Secure Your Seed Phrase',
          description: 'Write down your seed phrase on paper and store it somewhere safe (safe deposit box, safe at home). Do not take screenshots or store it digitally.',
        },
        {
          step: '4. Set a Password',
          description: 'Create a strong password for your wallet. This is used to unlock your wallet on your device, but your seed phrase is needed to recover access if you lose your password.',
        },
      ]
    },
    {
      id: 'get-crypto',
      title: 'How to Get Cryptocurrency',
      content: [
        {
          step: '1. Use an Exchange',
          description: 'Create an account on a cryptocurrency exchange like Coinbase, Kraken, or Binance. These platforms let you buy crypto with your bank account or credit card.',
        },
        {
          step: '2. Verify Your Identity',
          description: 'Most exchanges require identity verification for security. This is a standard process - provide your ID and proof of address.',
        },
        {
          step: '3. Add Payment Method',
          description: 'Link your bank account or credit card to the exchange. Start with a small amount if you\'re new to crypto.',
        },
        {
          step: '4. Buy Crypto',
          description: 'Purchase the cryptocurrency (Bitcoin, Ethereum, etc.). The amount you need depends on current prices - check the current exchange rate.',
        },
        {
          step: '5. Transfer to Your Wallet',
          description: 'Copy your wallet address from your wallet app and paste it as the destination on the exchange. The crypto will arrive in your wallet within minutes.',
        },
      ]
    },
    {
      id: 'send-payment',
      title: 'Sending Crypto to Complete Your Purchase',
      content: [
        {
          step: '1. Copy the Payment Address',
          description: 'On this checkout page, you\'ll see a wallet address that we provide. Click the copy button to copy it to your clipboard.',
        },
        {
          step: '2. Open Your Wallet',
          description: 'Open your crypto wallet app and look for the "Send" or "Transfer" button.',
        },
        {
          step: '3. Paste the Address',
          description: 'Paste the payment address you copied. ALWAYS verify the address matches what we provided - copy/paste errors can lose funds.',
        },
        {
          step: '4. Enter Amount',
          description: 'Type in the exact amount of crypto shown on this page. Make sure your wallet has enough funds to cover the amount plus network fees.',
        },
        {
          step: '5. Confirm and Send',
          description: 'Review the transaction details carefully. Once you confirm, the transaction cannot be reversed. Click "Send" to complete the transfer.',
        },
        {
          step: '6. Wait for Confirmation',
          description: 'The blockchain will process your transaction. This can take 5 minutes to several hours depending on network congestion. You can track it with the transaction ID provided.',
        },
      ]
    },
    {
      id: 'security-tips',
      title: 'Security Best Practices',
      content: [
        {
          step: '✓ Always Verify Addresses',
          description: 'Double and triple check payment addresses before sending. Scammers use similar-looking addresses to steal funds.',
        },
        {
          step: '✓ Start Small',
          description: 'When trying a new wallet or exchange, send a small amount first to make sure everything works.',
        },
        {
          step: '✓ Never Share Your Seed Phrase',
          description: 'Legitimate companies will NEVER ask for your seed phrase. Anyone asking for it is trying to scam you.',
        },
        {
          step: '✓ Use Official Apps Only',
          description: 'Download wallets and exchanges only from official websites or app stores. Fake apps are designed to steal your funds.',
        },
        {
          step: '✓ Enable Security Features',
          description: 'Use 2-factor authentication (2FA) on your exchange and wallet accounts whenever available.',
        },
        {
          step: '✓ Keep Your Device Secure',
          description: 'Use antivirus software and keep your phone/computer updated with the latest security patches.',
        },
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Common Issues & Troubleshooting',
      content: [
        {
          step: 'Transaction Not Appearing',
          description: 'Blockchain transactions take time. Check the transaction ID on a blockchain explorer (like Etherscan for Ethereum). It usually appears within 10-30 minutes.',
        },
        {
          step: 'Insufficient Funds',
          description: 'Make sure you have enough crypto to cover both the payment amount AND network fees. Network fees vary based on blockchain congestion.',
        },
        {
          step: 'Wrong Address Sent',
          description: 'If you sent to the wrong address, the funds may be permanently lost. Always verify addresses before sending.',
        },
        {
          step: 'Wallet Won\'t Connect',
          description: 'Try refreshing your browser, clearing cache, or using a different browser. Update your wallet app to the latest version.',
        },
        {
          step: 'Need More Help?',
          description: 'Contact our support team with your transaction ID and details of the issue. We\'re here to help!',
        },
      ]
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 bg-red-600 rounded-full shadow-lg hover:bg-red-500 transition-all hover:scale-125 hover:brightness-125"
        style={{ opacity: 0.2 }}
        title="Crypto wallet help"
      >
        <HelpCircle className="w-5 h-5 text-white" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-stone-900 border border-stone-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-amber-50">Crypto Wallet Tutorial</DialogTitle>
            <DialogDescription className="text-stone-400">
              Complete guide to using a cryptocurrency wallet and completing your purchase
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {sections.map((section) => (
              <div key={section.id} className="bg-stone-800/50 border border-stone-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-stone-700/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-amber-50 text-left">{section.title}</h3>
                  {expandedSection === section.id ? (
                    <ChevronUp className="w-5 h-5 text-red-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-500" />
                  )}
                </button>

                {expandedSection === section.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-stone-700">
                    {section.content.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="text-amber-50 font-semibold text-sm">{item.step}</p>
                        <p className="text-stone-400 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 bg-yellow-950/30 border border-yellow-700/50 rounded-lg p-4">
            <p className="text-yellow-100 text-sm">
              <span className="font-semibold">⚠️ Important:</span> Cryptocurrency transactions are irreversible. Always double-check payment addresses and amounts before confirming any transaction.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}