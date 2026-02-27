import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const GREEN_CLIENT_ID = Deno.env.get("GREEN_MONEY_CLIENT_ID");
const GREEN_SECRET_KEY = Deno.env.get("GREEN_MONEY_SECRET_KEY");
const GREEN_BASE_URL = 'https://greenbyphone.com';

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

    if (!GREEN_CLIENT_ID || !GREEN_SECRET_KEY) {
      return Response.json({ error: 'Payment provider not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'createCustomer') {
      const { firstName, lastName, email, phone, address, city, state, zip, country } = body;

      const formData = new URLSearchParams();
      formData.append('ClientID', GREEN_CLIENT_ID);
      formData.append('ApiPassword', GREEN_SECRET_KEY);
      formData.append('FirstName', firstName || '');
      formData.append('LastName', lastName || '');
      formData.append('Email', email || '');
      // Do NOT send phone — Green.money rejects if it matches the merchant's own phone number
      formData.append('Address', address || '');
      formData.append('City', city || '');
      formData.append('State', state || '');
      formData.append('Zip', zip || '');
      formData.append('Country', country || 'US');

      const res = await fetch(`${GREEN_BASE_URL}/API/CreatePayor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      if (!res.ok || data.Error) {
        console.error('CreatePayor error:', JSON.stringify(data));
        return Response.json({ error: data.Error || data.Message || 'Failed to create customer', raw: data }, { status: 400 });
      }

      return Response.json({ payorId: data.PayorID || data.payorId || data.ID });

    } else if (action === 'getCustomerInfo') {
      const { payorId } = body;

      const formData = new URLSearchParams();
      formData.append('ClientID', GREEN_CLIENT_ID);
      formData.append('SecretKey', GREEN_SECRET_KEY);
      formData.append('PayorID', payorId);

      const res = await fetch(`${GREEN_BASE_URL}/API/GetPayor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      const bankConnected = !!(data.BankName || data.AccountLast4 || data.bankConnected);

      return Response.json({
        bankConnected,
        bankName: data.BankName || data.bankName || 'Bank Account',
        accountLast4: data.AccountLast4 || data.accountLast4 || null,
      });

    } else if (action === 'createDraft') {
      const { payorId, amount, orderNumber, email, turnstileToken } = body;

      if (!payorId || !amount || !orderNumber) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const formData = new URLSearchParams();
      formData.append('ClientID', GREEN_CLIENT_ID);
      formData.append('SecretKey', GREEN_SECRET_KEY);
      formData.append('PayorID', payorId);
      formData.append('Amount', parseFloat(amount).toFixed(2));
      formData.append('CheckMemo', `Order ${orderNumber}`);
      formData.append('EmailAddress', email || '');

      const res = await fetch(`${GREEN_BASE_URL}/API/CreateDraft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      if (!res.ok || data.Error) {
        return Response.json({ error: data.Error || data.Message || 'Payment failed' }, { status: 400 });
      }

      return Response.json({
        success: true,
        checkId: data.CheckID || data.checkId || data.ID,
        verifyResult: data.VerifyResult || data.verifyResult || null,
      });

    } else {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    console.error('GreenMoney checkout error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});