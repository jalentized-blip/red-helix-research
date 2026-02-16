import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { hashSensitiveData } from './encryptionUtils.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id, amount, plaid_item_id } = await req.json();
    const userEmailHash = await hashSensitiveData(user.email);

    // Calculate risk score
    const riskFactors = await analyzeRiskFactors(base44, user, order_id, amount, plaid_item_id);
    const riskScore = calculateRiskScore(riskFactors);
    const riskLevel = getRiskLevel(riskScore);

    // Create audit log
    await base44.asServiceRole.entities.PlaidAuditLog.create({
      action: 'payment_creation',
      user_email: userEmailHash,
      order_id,
      plaid_item_id,
      success: true,
      metadata: JSON.stringify({ risk_score: riskScore, risk_level: riskLevel })
    });

    // Create fraud alert if high risk
    if (riskScore >= 50) {
      const alert = await base44.asServiceRole.entities.PlaidFraudAlert.create({
        user_email: user.email,
        order_id,
        risk_score: riskScore,
        risk_level: riskLevel,
        alert_type: riskFactors.primaryRisk,
        details: JSON.stringify(riskFactors),
        status: riskScore >= 75 ? 'pending' : 'approved'
      });

      // Send alert to admins if critical
      if (riskScore >= 75) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: 'admin@redhelixresearch.com',
          subject: `CRITICAL: High-Risk Payment Detected - Order ${order_id}`,
          body: `Risk Score: ${riskScore}/100\nUser: ${user.email}\nOrder: ${order_id}\nAmount: $${amount}\n\nReview required: /PlaidAdminDashboard`
        });
      }
    }

    return Response.json({
      risk_score: riskScore,
      risk_level: riskLevel,
      requires_review: riskScore >= 75,
      factors: riskFactors
    });

  } catch (error) {
    console.error('Fraud detection error:', error);
    return Response.json({ error: 'Fraud detection failed' }, { status: 500 });
  }
});

async function analyzeRiskFactors(base44, user, orderId, amount, plaidItemId) {
  const factors = {
    failedPayments: 0,
    velocityScore: 0,
    amountAnomaly: 0,
    newAccount: 0,
    ipChanges: 0,
    primaryRisk: 'low'
  };

  // Check failed payment history
  const failedPayments = await base44.asServiceRole.entities.Order.filter({
    created_by: user.email,
    payment_status: 'failed'
  });
  factors.failedPayments = failedPayments?.length || 0;

  // Check velocity (payments in last 24 hours)
  const recentOrders = await base44.asServiceRole.entities.Order.filter({
    created_by: user.email
  });
  
  const last24h = recentOrders?.filter(o => {
    const orderTime = new Date(o.created_date).getTime();
    const now = Date.now();
    return (now - orderTime) < 24 * 60 * 60 * 1000;
  }) || [];
  
  factors.velocityScore = last24h.length;

  // Check amount anomaly
  if (recentOrders && recentOrders.length > 0) {
    const avgAmount = recentOrders.reduce((sum, o) => sum + o.total_amount, 0) / recentOrders.length;
    const deviation = Math.abs(amount - avgAmount) / avgAmount;
    factors.amountAnomaly = deviation > 2 ? 1 : 0; // Flag if >200% different
  }

  // Check account age
  const userCreated = new Date(user.created_date).getTime();
  const accountAgeDays = (Date.now() - userCreated) / (1000 * 60 * 60 * 24);
  factors.newAccount = accountAgeDays < 7 ? 1 : 0;

  // Determine primary risk
  if (factors.failedPayments >= 3) factors.primaryRisk = 'multiple_failures';
  else if (factors.velocityScore >= 5) factors.primaryRisk = 'velocity';
  else if (factors.amountAnomaly === 1) factors.primaryRisk = 'unusual_amount';
  else if (factors.newAccount === 1 && amount > 500) factors.primaryRisk = 'synthetic_identity';

  return factors;
}

function calculateRiskScore(factors) {
  let score = 0;

  // Failed payments (0-30 points)
  score += Math.min(factors.failedPayments * 10, 30);

  // Velocity (0-25 points)
  score += Math.min(factors.velocityScore * 5, 25);

  // Amount anomaly (0-20 points)
  score += factors.amountAnomaly * 20;

  // New account (0-15 points)
  score += factors.newAccount * 15;

  // IP changes (0-10 points)
  score += factors.ipChanges * 5;

  return Math.min(Math.round(score), 100);
}

function getRiskLevel(score) {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}