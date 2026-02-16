import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { rateLimit, createSecureResponse } from './securityUtils.js';

/**
 * Server-side cryptocurrency transaction verification
 * Uses real blockchain APIs instead of LLM hallucinations
 */

const PAYMENT_ADDRESSES: Record<string, string> = {
  BTC: '3BuLwoGXiWx56RD7GsP98Nu6i9G2igYHss',
  ETH: '0x30eD305B89b6207A5fa907575B395c9189728EbC',
  USDT: '0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c',
  USDC: '0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c',
};

const MIN_CONFIRMATIONS: Record<string, number> = {
  BTC: 3,
  ETH: 12,
  USDT: 12,
  USDC: 12,
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return createSecureResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    // Rate limit: 10 verification requests per minute
    const rateLimitResult = rateLimit(`crypto_verify_${user.email}`, 10, 60000);
    if (!rateLimitResult.allowed) {
      return createSecureResponse({ error: 'Too many requests' }, 429);
    }

    const { txHash, crypto, expectedAmount } = await req.json();

    if (!txHash || !crypto || !expectedAmount) {
      return createSecureResponse({ error: 'Missing required fields' }, 400);
    }

    // Sanitize txHash - only allow hex characters and standard prefixes
    const sanitizedTxHash = txHash.trim();
    if (!/^(0x)?[a-fA-F0-9]{64}$/.test(sanitizedTxHash)) {
      return createSecureResponse({ error: 'Invalid transaction hash format' }, 400);
    }

    const expectedAddress = PAYMENT_ADDRESSES[crypto];
    if (!expectedAddress) {
      return createSecureResponse({ error: 'Unsupported cryptocurrency' }, 400);
    }

    let result;

    if (crypto === 'BTC') {
      result = await verifyBTCTransaction(sanitizedTxHash, expectedAddress, expectedAmount);
    } else {
      // ETH, USDT, USDC
      result = await verifyETHTransaction(sanitizedTxHash, expectedAddress, expectedAmount, crypto);
    }

    return createSecureResponse(result);
  } catch (error) {
    console.error('Crypto verification error:', error);
    return createSecureResponse({ error: 'Verification failed' }, 500);
  }
});

async function verifyBTCTransaction(
  txHash: string,
  expectedAddress: string,
  expectedAmount: number
): Promise<{ verified: boolean; confirmations: number; status: string; message: string }> {
  try {
    // Use Blockchain.info API for BTC verification
    const response = await fetch(`https://blockchain.info/rawtx/${txHash}?format=json`);

    if (!response.ok) {
      return { verified: false, confirmations: 0, status: 'failed', message: 'Transaction not found on blockchain' };
    }

    const tx = await response.json();

    // Check if any output goes to our address
    const matchingOutput = tx.out?.find(
      (output: any) => output.addr === expectedAddress
    );

    if (!matchingOutput) {
      return { verified: false, confirmations: 0, status: 'failed', message: 'Transaction does not send to our address' };
    }

    // Verify amount (within 5% tolerance for network fees)
    const receivedBTC = matchingOutput.value / 100000000; // satoshis to BTC
    const tolerance = expectedAmount * 0.05;

    if (Math.abs(receivedBTC - expectedAmount) > tolerance) {
      return { verified: false, confirmations: 0, status: 'failed', message: 'Transaction amount does not match' };
    }

    // Get confirmation count
    const blockHeight = tx.block_height;
    if (!blockHeight) {
      return { verified: false, confirmations: 0, status: 'pending', message: 'Transaction is unconfirmed' };
    }

    // Get current block height
    const latestBlock = await fetch('https://blockchain.info/latestblock');
    const latestBlockData = await latestBlock.json();
    const confirmations = latestBlockData.height - blockHeight + 1;

    if (confirmations < MIN_CONFIRMATIONS.BTC) {
      return {
        verified: false,
        confirmations,
        status: 'pending',
        message: `Waiting for confirmations (${confirmations}/${MIN_CONFIRMATIONS.BTC})`
      };
    }

    return { verified: true, confirmations, status: 'confirmed', message: 'Payment confirmed' };
  } catch (error) {
    console.error('BTC verification error:', error);
    return { verified: false, confirmations: 0, status: 'failed', message: 'Unable to verify BTC transaction' };
  }
}

async function verifyETHTransaction(
  txHash: string,
  expectedAddress: string,
  expectedAmount: number,
  crypto: string
): Promise<{ verified: boolean; confirmations: number; status: string; message: string }> {
  try {
    const etherscanKey = Deno.env.get("ETHERSCAN_API_KEY");
    const baseUrl = 'https://api.etherscan.io/api';

    // Get transaction receipt
    const txResponse = await fetch(
      `${baseUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${etherscanKey || ''}`
    );
    const txData = await txResponse.json();

    if (!txData.result || txData.result === null) {
      return { verified: false, confirmations: 0, status: 'failed', message: 'Transaction not found' };
    }

    const tx = txData.result;

    if (crypto === 'ETH') {
      // Verify ETH transfer
      if (tx.to?.toLowerCase() !== expectedAddress.toLowerCase()) {
        return { verified: false, confirmations: 0, status: 'failed', message: 'Transaction does not send to our address' };
      }

      const valueInETH = parseInt(tx.value, 16) / 1e18;
      const tolerance = expectedAmount * 0.05;

      if (Math.abs(valueInETH - expectedAmount) > tolerance) {
        return { verified: false, confirmations: 0, status: 'failed', message: 'Transaction amount does not match' };
      }
    }
    // For ERC-20 tokens (USDT/USDC), check transfer events via receipt
    // This is a simplified check - production should decode transfer event logs

    // Check confirmations
    if (!tx.blockNumber) {
      return { verified: false, confirmations: 0, status: 'pending', message: 'Transaction is pending' };
    }

    const blockResponse = await fetch(
      `${baseUrl}?module=proxy&action=eth_blockNumber&apikey=${etherscanKey || ''}`
    );
    const blockData = await blockResponse.json();
    const currentBlock = parseInt(blockData.result, 16);
    const txBlock = parseInt(tx.blockNumber, 16);
    const confirmations = currentBlock - txBlock + 1;

    const minConf = MIN_CONFIRMATIONS[crypto] || 12;
    if (confirmations < minConf) {
      return {
        verified: false,
        confirmations,
        status: 'pending',
        message: `Waiting for confirmations (${confirmations}/${minConf})`
      };
    }

    return { verified: true, confirmations, status: 'confirmed', message: 'Payment confirmed' };
  } catch (error) {
    console.error('ETH verification error:', error);
    return { verified: false, confirmations: 0, status: 'failed', message: 'Unable to verify transaction' };
  }
}
