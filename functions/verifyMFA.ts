import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Server-side MFA code generation and verification
 * Codes are stored server-side in the MFAChallenge entity, never exposed to the client
 */

function generateSecureCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (100000 + (array[0] % 900000)).toString();
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, code, challengeId } = await req.json();

    switch (action) {
      case 'generate': {
        const mfaCode = generateSecureCode();
        const expiresAt = new Date(Date.now() + 300000).toISOString(); // 5 minutes

        // Store code server-side
        const challenge = await base44.asServiceRole.entities.MFAChallenge.create({
          user_email: user.email,
          code_hash: await hashCode(mfaCode),
          expires_at: expiresAt,
          attempts: 0,
          verified: false
        });

        // Send code via email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: 'Red Helix Research - Verification Code',
          body: `Your verification code: ${mfaCode}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this, please contact support immediately.`
        });

        return Response.json({
          success: true,
          challengeId: challenge.id,
          expiresAt
        }, {
          headers: secureHeaders()
        });
      }

      case 'verify': {
        if (!code || !challengeId) {
          return Response.json({ error: 'Missing code or challengeId' }, { status: 400 });
        }

        // Retrieve challenge
        const challenges = await base44.asServiceRole.entities.MFAChallenge.filter({
          id: challengeId,
          user_email: user.email
        });

        if (!challenges || challenges.length === 0) {
          return Response.json({ error: 'Invalid challenge' }, { status: 400 });
        }

        const challenge = challenges[0];

        // Check if already verified
        if (challenge.verified) {
          return Response.json({ error: 'Challenge already used' }, { status: 400 });
        }

        // Check expiration
        if (new Date(challenge.expires_at).getTime() < Date.now()) {
          return Response.json({ error: 'Code expired' }, { status: 400 });
        }

        // Check attempt limit (max 5 attempts)
        if (challenge.attempts >= 5) {
          return Response.json({ error: 'Too many attempts. Request a new code.' }, { status: 429 });
        }

        // Increment attempts
        await base44.asServiceRole.entities.MFAChallenge.update(challenge.id, {
          attempts: challenge.attempts + 1
        });

        // Verify code
        const codeHash = await hashCode(code);
        if (codeHash !== challenge.code_hash) {
          return Response.json({ error: 'Invalid code' }, { status: 400 });
        }

        // Mark as verified
        await base44.asServiceRole.entities.MFAChallenge.update(challenge.id, {
          verified: true
        });

        return Response.json({
          success: true,
          verified: true
        }, {
          headers: secureHeaders()
        });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('MFA error:', error);
    return Response.json({ error: 'MFA verification failed' }, { status: 500 });
  }
});

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(code));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function secureHeaders(): HeadersInit {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
}
