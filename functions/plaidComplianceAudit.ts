import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { decryptFinancialData } from './encryptionUtils.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Admin auth check
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { type } = await req.json();
    const reportType = type || 'data_retention';

    let report;
    switch (reportType) {
      case 'data_retention':
        report = await auditDataRetention(base44);
        break;
      case 'encryption_audit':
        report = await auditEncryption(base44);
        break;
      case 'consent_compliance':
        report = await auditConsent(base44);
        break;
      case 'data_integrity':
        report = await auditDataIntegrity(base44);
        break;
      default:
        return Response.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // Store report
    await base44.asServiceRole.entities.PlaidComplianceReport.create(report);

    return Response.json({ success: true, report });

  } catch (error) {
    console.error('Compliance audit error:', error);
    return Response.json({ error: 'Audit failed' }, { status: 500 });
  }
});

async function auditDataRetention(base44) {
  const now = Date.now();
  const findings = [];
  let issuesFound = 0;

  // Check EncryptedFinancialData for expired records
  const financialData = await base44.asServiceRole.entities.EncryptedFinancialData.list();
  
  for (const record of financialData) {
    if (record.expires_at) {
      const expiresAt = new Date(record.expires_at).getTime();
      if (expiresAt < now) {
        issuesFound++;
        findings.push({
          type: 'expired_data',
          record_id: record.id,
          data_type: record.data_type,
          expired_days: Math.floor((now - expiresAt) / (1000 * 60 * 60 * 24))
        });
      }
    }
  }

  // Check PlaidPaymentMethod for inactive methods
  const paymentMethods = await base44.asServiceRole.entities.PlaidPaymentMethod.list();
  const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
  
  for (const method of paymentMethods) {
    if (method.status === 'inactive') {
      const lastUsed = method.last_used ? new Date(method.last_used).getTime() : 0;
      if (lastUsed < ninetyDaysAgo) {
        issuesFound++;
        findings.push({
          type: 'inactive_payment_method',
          record_id: method.id,
          days_inactive: Math.floor((now - lastUsed) / (1000 * 60 * 60 * 24))
        });
      }
    }
  }

  const complianceScore = Math.max(0, 100 - (issuesFound * 5));

  return {
    report_type: 'data_retention',
    report_period_start: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    report_period_end: new Date(now).toISOString(),
    total_records_reviewed: financialData.length + paymentMethods.length,
    issues_found: issuesFound,
    findings: JSON.stringify(findings),
    recommendations: issuesFound > 0 ? 'Trigger automated deletion for expired records' : 'All records within retention policy',
    compliance_score: complianceScore,
    status: issuesFound > 0 ? 'action_required' : 'reviewed'
  };
}

async function auditEncryption(base44) {
  const findings = [];
  let issuesFound = 0;

  // Check all EncryptedFinancialData records
  const financialData = await base44.asServiceRole.entities.EncryptedFinancialData.list();
  
  for (const record of financialData) {
    if (!record.encrypted_data || record.encrypted_data.length < 20) {
      issuesFound++;
      findings.push({
        type: 'missing_encryption',
        record_id: record.id,
        data_type: record.data_type
      });
    }

    if (!record.data_hash) {
      issuesFound++;
      findings.push({
        type: 'missing_hash',
        record_id: record.id,
        data_type: record.data_type
      });
    }
  }

  const complianceScore = Math.max(0, 100 - (issuesFound * 10));

  return {
    report_type: 'encryption_audit',
    report_period_start: new Date().toISOString(),
    report_period_end: new Date().toISOString(),
    total_records_reviewed: financialData.length,
    issues_found: issuesFound,
    findings: JSON.stringify(findings),
    recommendations: issuesFound > 0 ? 'Re-encrypt flagged records immediately' : 'All financial data properly encrypted',
    compliance_score: complianceScore,
    status: issuesFound > 0 ? 'action_required' : 'reviewed'
  };
}

async function auditConsent(base44) {
  const findings = [];
  let issuesFound = 0;

  // Check payment methods without consent
  const paymentMethods = await base44.asServiceRole.entities.PlaidPaymentMethod.list();
  
  for (const method of paymentMethods) {
    const consents = await base44.asServiceRole.entities.FinancialConsent.filter({
      user_email: method.user_email,
      consent_type: 'plaid_ach',
      consent_given: true
    });

    const validConsent = consents?.find(c => !c.withdrawal_timestamp);
    
    if (!validConsent) {
      issuesFound++;
      findings.push({
        type: 'missing_consent',
        user_email: method.user_email,
        payment_method_id: method.id
      });
    }
  }

  const complianceScore = Math.max(0, 100 - (issuesFound * 15));

  return {
    report_type: 'consent_compliance',
    report_period_start: new Date().toISOString(),
    report_period_end: new Date().toISOString(),
    total_records_reviewed: paymentMethods.length,
    issues_found: issuesFound,
    findings: JSON.stringify(findings),
    recommendations: issuesFound > 0 ? 'Require consent re-verification for flagged users' : 'All payment methods have valid consent',
    compliance_score: complianceScore,
    status: issuesFound > 0 ? 'action_required' : 'reviewed'
  };
}

async function auditDataIntegrity(base44) {
  const findings = [];
  let issuesFound = 0;

  // Verify encrypted data can be decrypted
  const financialData = await base44.asServiceRole.entities.EncryptedFinancialData.list();
  let sampleSize = Math.min(10, financialData.length);
  
  for (let i = 0; i < sampleSize; i++) {
    const record = financialData[i];
    try {
      await decryptFinancialData(record.encrypted_data);
    } catch (error) {
      issuesFound++;
      findings.push({
        type: 'decryption_failed',
        record_id: record.id,
        data_type: record.data_type,
        error: error.message
      });
    }
  }

  const complianceScore = Math.max(0, 100 - (issuesFound * 20));

  return {
    report_type: 'data_integrity',
    report_period_start: new Date().toISOString(),
    report_period_end: new Date().toISOString(),
    total_records_reviewed: sampleSize,
    issues_found: issuesFound,
    findings: JSON.stringify(findings),
    recommendations: issuesFound > 0 ? 'CRITICAL: Investigate encryption key issues immediately' : 'Data integrity verified',
    compliance_score: complianceScore,
    status: issuesFound > 0 ? 'action_required' : 'reviewed'
  };
}