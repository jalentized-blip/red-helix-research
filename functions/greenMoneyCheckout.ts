import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const GREEN_CLIENT_ID = Deno.env.get("GREEN_MONEY_CLIENT_ID");
const GREEN_API_PASSWORD = Deno.env.get("GREEN_MONEY_SECRET_KEY");
const GREEN_ENDPOINT = 'https://greenbyphone.com/echeck.asmx';

async function greenPost(method, params) {
  const formData = new URLSearchParams({
    Client_ID: GREEN_CLIENT_ID,
    ApiPassword: GREEN_API_PASSWORD,
    x_delim_data: 'FALSE',
    ...params,
  });

  const res = await fetch(`${GREEN_ENDPOINT}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  const text = await res.text();
  console.log(`[${method}] status=${res.status} response=${text}`);

  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  return { ok: res.ok, data, status: res.status };
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

    if (!GREEN_CLIENT_ID || !GREEN_API_PASSWORD) {
      return Response.json({ error: 'Payment provider not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'createCustomer') {
      const { firstName, lastName, email, address, city, state, zip, country } = body;

      const { ok, data } = await greenPost('CreateCustomer', {
        FirstName: firstName || '',
        LastName: lastName || '',
        EmailAddress: email || '',
        Address1: address || '',
        City: city || '',
        State: state || '',
        Zip: zip || '',
        Country: country || 'US',
      });

      if (!ok || data.Error || data.Result === '0') {
        const msg = data.Error || data.ResultDescription || data.Message || JSON.stringify(data);
        return Response.json({ error: msg }, { status: 400 });
      }

      const payorId = data.Customer_ID || data.CustomerID || data.customer_id || data.ID;
      if (!payorId) {
        return Response.json({ error: 'No customer ID returned', raw: data }, { status: 400 });
      }

      return Response.json({ payorId });

    } else if (action === 'getCustomerInfo') {
      const { payorId } = body;

      const { ok, data } = await greenPost('GetCustomerInformation', {
        Customer_ID: payorId,
      });

      const bankConnected = !!(data.BankName || data.AccountLast4 || data.RoutingNumber);

      return Response.json({
        bankConnected,
        bankName: data.BankName || data.bankName || 'Bank Account',
        accountLast4: data.AccountLast4 || data.accountLast4 || null,
      });

    } else if (action === 'createDraft') {
      const { payorId, amount, orderNumber, email, routingNumber, accountNumber, bankName } = body;

      if (!payorId || !amount || !orderNumber) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Use CustomerOneTimeDraftRTV if we have a saved customer, or OneTimeDraftRTV with full bank info
      let method, params;

      if (routingNumber && accountNumber) {
        // Direct draft with bank info
        method = 'CustomerOneTimeDraftRTV';
        params = {
          Customer_ID: payorId,
          Amount: parseFloat(amount).toFixed(2),
          Memo: `Order ${orderNumber}`,
          EmailAddress: email || '',
          RoutingNumber: routingNumber,
          AccountNumber: accountNumber,
          BankName: bankName || '',
        };
      } else {
        // Customer on file draft
        method = 'CustomerOneTimeDraftRTV';
        params = {
          Customer_ID: payorId,
          Amount: parseFloat(amount).toFixed(2),
          Memo: `Order ${orderNumber}`,
          EmailAddress: email || '',
        };
      }

      const { ok, data } = await greenPost(method, params);

      if (!ok || data.Error || data.Result === '0') {
        const msg = data.Error || data.ResultDescription || data.Message || JSON.stringify(data);
        return Response.json({ error: msg }, { status: 400 });
      }

      return Response.json({
        success: true,
        checkId: data.Check_ID || data.CheckID || data.check_id || data.ID,
        verifyResult: data.VerifyResult || data.verifyResult || data.Result || null,
        resultDescription: data.ResultDescription || null,
      });

    } else {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    console.error('GreenMoney checkout error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});