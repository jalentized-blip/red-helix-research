import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication NOT required - guests can browse and purchase
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl,
  onAuthError: () => {
    // Do NOT redirect to login on auth errors — app is public
    // Guests can browse and checkout without an account
  }
});