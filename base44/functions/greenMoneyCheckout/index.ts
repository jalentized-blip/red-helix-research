// ============================================================================
// greenMoneyCheckout — Green.money / GreenByPhone ACH Checkout
// ============================================================================
// Server-side proxy for Green.money's SOAP/XML API.
// All credentials stay server-side — browser never sees them.
//
// Actions:
//   createCustomer   — Create customer record, returns Payor_ID
//   getCustomerInfo  — Verify bank was connected via Plaid iframe
//   createDraft      — Execute ACH payment (one-time draft, real-time verification)
//
// Security layers:
//   1. Cloudflare Turnstile verification (on createDraft)
//   2. Rate limiting (per-email + global)
//   3. Input validation
//   4. Comprehensive logging
// ============================================================================

// --- Credentials (server-side only) ---
const GREEN_CLIENT_ID = '118636';
const GREEN_API_PASSWORD = 'hw7iv1jx5d';
const GREEN_BASE_URL = 'https://greenbyphone.com/eCheck.asmx';

// --- Turnstile ---
const TURNSTILE_SECRET_KEY = '0x4AAAAAACfCmfXN08E0PuGUsBRffIvY_FE';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// --- Rate Limiting ---
const emailRateLimits = new Map<string, { count: number; resetAt: number }>();
let globalCount = 0;
let globalResetAt = 0;
const MAX_PER_EMAIL_PER_HOUR = 5;
const MAX_GLOBAL_PER_HOUR = 50;

function checkRateLimit(email: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  // Global
  if (now > globalResetAt) {
    globalCount = 0;
    globalResetAt = now + oneHour;
  }
  if (globalCount >= MAX_GLOBAL_PER_HOUR) {
    return { allowed: false, reason: 'System is experiencing high volume. Please try again later.' };
  }

  // Per-email
  const key = email.toLowerCase().trim();
  const entry = emailRateLimits.get(key);
  if (entry) {
    if (now > entry.resetAt) {
      emailRateLimits.set(key, { count: 1, resetAt: now + oneHour });
    } else if (entry.count >= MAX_PER_EMAIL_PER_HOUR) {
      return { allowed: false, reason: 'Too many payment requests for this email. Please try again later.' };
    } else {
      entry.count++;
    }
  } else {
    emailRateLimits.set(key, { count: 1, resetAt: now + oneHour });
  }

  // Cleanup ~5% of requests
  if (Math.random() < 0.05) {
    for (const [k, v] of emailRateLimits) {
      if (now > v.resetAt) emailRateLimits.delete(k);
    }
  }

  globalCount++;
  return { allowed: true };
}

// --- Validation ---
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 5000;

function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- XML Helpers ---
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSoapRequest(endpointName: string, params: Record<string, string>): string {
  const paramXml = Object.entries(params)
    .map(([key, value]) => `      <${key}>${escapeXml(value)}</${key}>`)
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${endpointName} xmlns="CheckProcessing">
${paramXml}
    </${endpointName}>
  </soap:Body>
</soap:Envelope>`;
}

function extractXmlValue(xml: string, tagName: string): string | null {
  // Case-insensitive regex to handle varying SOAP response formats
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

async function callGreenMoney(endpointName: string, params: Record<string, string>): Promise<string> {
  const body = buildSoapRequest(endpointName, params);

  const response = await fetch(GREEN_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': `"CheckProcessing/${endpointName}"`,
    },
    body,
  });

  const text = await response.text();

  // SOAP APIs can return 500 with a fault, but also return 200 with error Result codes.
  // Check for SOAP Fault in the response body regardless of status code.
  if (text.includes('soap:Fault') || text.includes('soap:fault')) {
    const faultString = extractXmlValue(text, 'faultstring') || 'Unknown SOAP fault';
    console.error(`[GREEN_MONEY][SOAP_FAULT] ${endpointName} status=${response.status} fault=${faultString}`);
    throw new Error(`Green.money SOAP fault: ${faultString}`);
  }

  if (!response.ok) {
    console.error(`[GREEN_MONEY][API_ERROR] ${endpointName} status=${response.status} body=${text.substring(0, 500)}`);
    throw new Error(`Green.money API returned ${response.status}`);
  }

  return text;
}

// --- Client IP extraction (Cloudflare-aware) ---
function getClientIP(req: Request): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  return req.headers.get('cf-connecting-ip')
    || (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null)
    || req.headers.get('x-real-ip')
    || 'unknown';
}

// --- Turnstile verification (fail-closed) ---
async function verifyTurnstile(token: string, clientIP: string): Promise<{ success: boolean; error?: string }> {
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'Security verification required.' };
  }

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: clientIP,
      }),
    });
    const data = await res.json();

    if (!data.success) {
      return { success: false, error: 'Verification failed. Please refresh the page and try again.' };
    }
    return { success: true };
  } catch (err) {
    // Fail-closed: reject if Cloudflare is unreachable
    console.error(`[GREEN_MONEY][TURNSTILE_ERROR] ip=${clientIP} error=${err.message}`);
    return { success: false, error: 'Security verification unavailable. Please try again in a moment.' };
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

// --- createCustomer ---
// Green.money SOAP API requires ALL parameter elements in the XML envelope,
// even if empty. NickName, BankAccountCompanyName, and PhoneWork are also
// required despite being listed as "optional" in the docs.
async function handleCreateCustomer(body: any, clientIP: string): Promise<Response> {
  const { firstName, lastName, email } = body;

  if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
    return Response.json({ error: 'First name is required.' }, { status: 400 });
  }
  if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
    return Response.json({ error: 'Last name is required.' }, { status: 400 });
  }

  // Generate a unique nickname (required by Green.money)
  const nickname = `${firstName.trim()}${lastName.trim()}_${Date.now()}`;

  try {
    // Green.money requires ALL parameter elements present in XML, even if empty.
    // NickName, PhoneWork, and BankAccountCompanyName are effectively required.
    const responseXml = await callGreenMoney('CreateCustomer', {
      Client_ID: GREEN_CLIENT_ID,
      ApiPassword: GREEN_API_PASSWORD,
      NickName: nickname,
      NameFirst: firstName.trim(),
      NameLast: lastName.trim(),
      PhoneWork: '100-000-0000',
      PhoneWorkExtension: '',
      EmailAddress: email ? String(email).trim() : '',
      MerchantAccountNumber: '',
      BankAccountCompanyName: 'N/A',
      BankAccountAddress1: 'N/A',
      BankAccountAddress2: '',
      BankAccountCity: 'N/A',
      BankAccountState: 'CA',
      BankAccountZip: '00000',
      BankAccountCountry: 'US',
      BankName: '',
      RoutingNumber: '',
      AccountNumber: '',
      Note: '',
      x_delim_data: '',
      x_delim_char: '',
    });

    // Check for API-level error first (Result != 0)
    const result = extractXmlValue(responseXml, 'Result');
    const resultDescription = extractXmlValue(responseXml, 'ResultDescription');

    // Extract Payor_ID from response
    const payorId = extractXmlValue(responseXml, 'Payor_ID')
                 || extractXmlValue(responseXml, 'PayorID');

    if (!payorId || payorId === '0' || payorId === '') {
      console.error(`[GREEN_MONEY][CREATE_CUSTOMER_FAILED] email=${email || 'N/A'} ip=${clientIP} result=${result} desc=${resultDescription} xml=${responseXml.substring(0, 500)}`);
      return Response.json({ error: resultDescription || 'Failed to initialize payment. Please try again.' }, { status: 500 });
    }

    console.log(`[GREEN_MONEY][CUSTOMER_CREATED] email=${email || 'N/A'} payor_id=${payorId} ip=${clientIP}`);
    return Response.json({ success: true, payorId });
  } catch (err) {
    console.error(`[GREEN_MONEY][CREATE_CUSTOMER_ERROR] email=${email || 'N/A'} ip=${clientIP} error=${err.message}`);
    return Response.json({ error: 'Payment service unavailable. Please try again.' }, { status: 503 });
  }
}

// --- getCustomerInfo ---
async function handleGetCustomerInfo(body: any, clientIP: string): Promise<Response> {
  const { payorId } = body;

  if (!payorId || typeof payorId !== 'string') {
    return Response.json({ error: 'Invalid session.' }, { status: 400 });
  }

  try {
    const responseXml = await callGreenMoney('GetCustomerInformation', {
      Client_ID: GREEN_CLIENT_ID,
      ApiPassword: GREEN_API_PASSWORD,
      Payor_ID: payorId,
      x_delim_data: '',
      x_delim_char: '',
    });

    // Extract bank info (obfuscated by Green.money)
    const bankName = extractXmlValue(responseXml, 'BankName');
    const routingNumber = extractXmlValue(responseXml, 'RoutingNumber');
    const accountNumber = extractXmlValue(responseXml, 'AccountNumber');

    // Determine if bank was actually connected
    const hasBankInfo = !!(bankName || (accountNumber && accountNumber !== '' && accountNumber !== '0'));

    // Only return obfuscated last 4 digits
    const accountLast4 = accountNumber ? accountNumber.slice(-4) : null;

    console.log(`[GREEN_MONEY][CUSTOMER_INFO] payor_id=${payorId} bank_connected=${hasBankInfo} bank=${bankName || 'N/A'} ip=${clientIP}`);

    return Response.json({
      success: true,
      bankConnected: hasBankInfo,
      bankName: bankName || 'Connected Bank',
      accountLast4: accountLast4,
    });
  } catch (err) {
    console.error(`[GREEN_MONEY][GET_CUSTOMER_ERROR] payor_id=${payorId} ip=${clientIP} error=${err.message}`);
    return Response.json({ error: 'Failed to verify bank connection.' }, { status: 500 });
  }
}

// --- createDraft (payment execution) ---
async function handleCreateDraft(body: any, req: Request): Promise<Response> {
  const { payorId, amount, orderNumber, email, turnstileToken } = body;
  const clientIP = getClientIP(req);

  // --- Validate required fields ---
  if (!payorId || typeof payorId !== 'string') {
    return Response.json({ error: 'Invalid payment session.' }, { status: 400 });
  }
  if (!orderNumber || typeof orderNumber !== 'string') {
    return Response.json({ error: 'Order number required.' }, { status: 400 });
  }
  if (!email || !validateEmail(email)) {
    return Response.json({ error: 'Valid email required.' }, { status: 400 });
  }

  // --- Amount validation ---
  const checkAmount = parseFloat(amount);
  if (isNaN(checkAmount) || checkAmount < MIN_AMOUNT || checkAmount > MAX_AMOUNT) {
    console.warn(`[GREEN_MONEY][INVALID_AMOUNT] amount=${amount} email=${email} ip=${clientIP}`);
    return Response.json({ error: `Invalid payment amount. Must be between $${MIN_AMOUNT} and $${MAX_AMOUNT}.` }, { status: 400 });
  }

  // --- Turnstile verification (fail-closed) ---
  const turnstileResult = await verifyTurnstile(turnstileToken, clientIP);
  if (!turnstileResult.success) {
    console.warn(`[GREEN_MONEY][TURNSTILE_FAILED] email=${email} ip=${clientIP}`);
    return Response.json({ error: turnstileResult.error }, { status: 400 });
  }
  console.log(`[GREEN_MONEY][TURNSTILE_OK] email=${email} ip=${clientIP}`);

  // --- Rate limiting ---
  const rateCheck = checkRateLimit(email);
  if (!rateCheck.allowed) {
    console.warn(`[GREEN_MONEY][RATE_LIMIT] email=${email} ip=${clientIP} reason=${rateCheck.reason}`);
    return Response.json({ error: rateCheck.reason }, { status: 429 });
  }

  // --- Format date as MM/DD/YYYY ---
  const today = new Date();
  const checkDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;

  try {
    const responseXml = await callGreenMoney('CustomerOneTimeDraftRTV', {
      Client_ID: GREEN_CLIENT_ID,
      ApiPassword: GREEN_API_PASSWORD,
      Payor_ID: payorId,
      CheckMemo: `Order ${orderNumber}`,
      CheckAmount: checkAmount.toFixed(2),
      CheckDate: checkDate,
      x_delim_data: '',
      x_delim_char: '',
    });

    const verifyResult = extractXmlValue(responseXml, 'VerifyResult');
    const verifyDescription = extractXmlValue(responseXml, 'VerifyResultDescription');
    const checkNumber = extractXmlValue(responseXml, 'CheckNumber');
    const checkId = extractXmlValue(responseXml, 'Check_ID')
                 || extractXmlValue(responseXml, 'CheckID');

    // Evidence logging
    const serverUserAgent = req.headers.get('user-agent') || 'unknown';
    console.log(`[GREEN_MONEY][DRAFT] email=${email} order=${orderNumber} amount=$${checkAmount.toFixed(2)} payor=${payorId} verify=${verifyResult} desc=${verifyDescription || 'N/A'} check_id=${checkId || 'N/A'} check_num=${checkNumber || 'N/A'} ip=${clientIP} ua=${serverUserAgent}`);

    // VerifyResult = "0" typically means success in SOAP APIs
    // Also check for text-based success indicators
    const isSuccess = verifyResult === '0'
                   || verifyResult?.toLowerCase() === 'success'
                   || verifyResult?.toLowerCase() === 'true'
                   || verifyDescription?.toLowerCase()?.includes('success');

    if (isSuccess) {
      console.log(`[GREEN_MONEY][DRAFT_SUCCESS] email=${email} order=${orderNumber} amount=$${checkAmount.toFixed(2)} check_id=${checkId}`);
      return Response.json({
        success: true,
        checkId: checkId || checkNumber,
        verifyResult,
        verifyDescription,
      });
    } else {
      console.error(`[GREEN_MONEY][DRAFT_FAILED] email=${email} order=${orderNumber} verify=${verifyResult} desc=${verifyDescription} xml=${responseXml.substring(0, 500)}`);
      return Response.json({
        error: verifyDescription || 'Payment verification failed. Please try again.',
      }, { status: 400 });
    }
  } catch (err) {
    console.error(`[GREEN_MONEY][DRAFT_ERROR] email=${email} order=${orderNumber} ip=${clientIP} error=${err.message}`);
    return Response.json({ error: 'Payment service unavailable. Please try again.' }, { status: 503 });
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
Deno.serve(async (req) => {
  const startTime = Date.now();

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { action } = body;
    const clientIP = getClientIP(req);

    switch (action) {
      case 'createCustomer':
        return await handleCreateCustomer(body, clientIP);

      case 'getCustomerInfo':
        return await handleGetCustomerInfo(body, clientIP);

      case 'createDraft':
        return await handleCreateDraft(body, req);

      default:
        console.warn(`[GREEN_MONEY][UNKNOWN_ACTION] action=${action} ip=${clientIP}`);
        return Response.json({ error: 'Unknown action.' }, { status: 400 });
    }
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[GREEN_MONEY][FATAL] elapsed=${elapsed}ms error=${error.message}`);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
});
