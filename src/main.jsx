import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains' // ← change to base if using Base chain
import { createWeb3Modal } from '@web3modal/wagmi/react'
import App from './App.jsx' // ← your main app/router component

import './index.css' // ← keep your existing styles

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('Missing VITE_WALLETCONNECT_PROJECT_ID — add it to .env!')
}

const metadata = {
  name: 'Red Helix Research',
  description: 'Premium Research Peptides',
  url: window.location.origin,
  icons: ['https://redhelixresearch.com/logo.png'] // ← change to your real logo if you have one
}

const config = createConfig({
  chains: [mainnet], // ← add base here later if you want: import { base } from 'wagmi/chains'; then [mainnet, base]
  transports: {
    [mainnet.id]: http(),
  },
})

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains: config.chains,
  metadata,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#8b0000', // dark red accent to match your theme
    '--w3m-color-mix-strength': 60,
  }
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)
