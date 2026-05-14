import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { address, city, state, zip } = body;

    if (!address || !city || !state || !zip) {
      return Response.json({
        valid: false,
        reason: 'All address fields (street, city, state, ZIP) are required',
        confidence: 0,
        details: null
      });
    }

    const geoapifyKey = Deno.env.get('GEOAPIFY_API_KEY');
    if (!geoapifyKey) {
      return Response.json({
        valid: false,
        reason: 'Address validation service not configured',
        confidence: 0,
        details: null
      });
    }

    // Extract house number and street
    const addressParts = address.trim().split(/\s+/);
    const housenumber = /^\d+/.test(addressParts[0]) ? addressParts[0] : '';
    const street = housenumber ? addressParts.slice(1).join(' ') : address;

    // Use GeoJSON format (features array) — omit 'format' param entirely
    const params = new URLSearchParams({
      housenumber: housenumber,
      street: street,
      city: city,
      state: state,
      postcode: zip,
      filter: 'countrycode:us',
      limit: '1',
      apiKey: geoapifyKey
    });

    const geoapifyUrl = `https://api.geoapify.com/v1/geocode/search?${params}`;
    console.log('[validateAddressGeoapify] Calling:', geoapifyUrl.replace(geoapifyKey, 'KEY'));

    const geoapifyRes = await fetch(geoapifyUrl, {
      headers: { 'Accept': 'application/json' }
    });

    if (!geoapifyRes.ok) {
      console.error('[validateAddressGeoapify] API error:', geoapifyRes.status, await geoapifyRes.text());
      return Response.json({
        valid: false,
        reason: 'Address validation service error',
        confidence: 0,
        details: null
      });
    }

    const geoapifyData = await geoapifyRes.json();
    console.log('[validateAddressGeoapify] Raw response:', JSON.stringify(geoapifyData).slice(0, 500));

    if (!geoapifyData.features || geoapifyData.features.length === 0) {
      return Response.json({
        valid: false,
        reason: 'Address not found. Please verify your street, city, state, and ZIP.',
        confidence: 0,
        details: null
      });
    }

    const topResult = geoapifyData.features[0];
    const props = topResult.properties;
    const confidence = props.rank?.confidence ?? 0;
    const resultType = props.result_type || '';

    console.log('[validateAddressGeoapify] confidence:', confidence, 'type:', resultType);

    // Accept buildings at 0.65+, streets/addresses at 0.75+
    const isValid = (resultType === 'building' && confidence >= 0.65) ||
                    ((resultType === 'street' || resultType === 'amenity') && confidence >= 0.75) ||
                    confidence >= 0.8; // fallback: high confidence regardless of type

    const validatedAddress = {
      housenumber: props.housenumber || housenumber,
      street: props.street || street,
      city: props.city || city,
      state: props.state_code || props.state || state,
      postcode: props.postcode || zip,
      formatted: props.formatted || '',
      result_type: resultType
    };

    return Response.json({
      valid: isValid,
      confidence: confidence,
      reason: isValid
        ? 'Address verified successfully'
        : confidence < 0.5
        ? 'Address not recognized. Please double-check your street address.'
        : 'Partial match found. Please review your address.',
      details: validatedAddress
    });

  } catch (error) {
    console.error('[validateAddressGeoapify] Exception:', error.message);
    return Response.json({
      valid: false,
      reason: 'Address validation error: ' + error.message,
      confidence: 0,
      details: null
    });
  }
});