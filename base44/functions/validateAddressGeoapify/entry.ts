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

    // Validate required fields
    if (!address || !city || !state || !zip) {
      return Response.json({
        valid: false,
        reason: 'All address fields (street, city, state, ZIP) are required',
        confidence: 0,
        details: null
      }, { status: 200 });
    }

    // Build structured address query for Geoapify
    // Extract house number from address if present (e.g., "123 Main St" -> housenumber="123", street="Main St")
    const addressParts = address.trim().split(/\s+/);
    const housenumber = /^\d+/.test(addressParts[0]) ? addressParts[0] : '';
    const street = housenumber ? addressParts.slice(1).join(' ') : address;

    const geoapifyKey = Deno.env.get('GEOAPIFY_API_KEY');
    if (!geoapifyKey) {
      return Response.json({
        valid: false,
        reason: 'Address validation service not configured',
        confidence: 0,
        details: null
      }, { status: 200 });
    }

    // Call Geoapify Forward Geocoding API with structured address params
    // US-only filter for speed and accuracy
    const params = new URLSearchParams({
      housenumber: housenumber,
      street: street,
      city: city,
      state: state.toUpperCase(),
      postcode: zip,
      format: 'json',
      filter: 'countrycode:us', // US-only
      apiKey: geoapifyKey
    });

    const geoapifyUrl = `https://api.geoapify.com/v1/geocode/search?${params}`;
    const geoapifyRes = await fetch(geoapifyUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!geoapifyRes.ok) {
      return Response.json({
        valid: false,
        reason: 'Address validation service error',
        confidence: 0,
        details: null
      }, { status: 200 });
    }

    const geoapifyData = await geoapifyRes.json();

    // No results = invalid address
    if (!geoapifyData.features || geoapifyData.features.length === 0) {
      return Response.json({
        valid: false,
        reason: 'Address not found. Please verify street, city, state, and ZIP code.',
        confidence: 0,
        details: null
      }, { status: 200 });
    }

    // Use the first (best-match) result
    const topResult = geoapifyData.features[0];
    const props = topResult.properties;

    // Confidence score: must be >= 0.7 for acceptance
    const confidence = props.rank?.confidence ?? 0;
    const resultType = props.result_type || '';

    // Accept if:
    // 1. High confidence (>= 0.75) AND proper result type (building or street)
    // 2. Moderate-high confidence (>= 0.65) AND building result
    const isHighConfidence = confidence >= 0.75 && (resultType === 'building' || resultType === 'street');
    const isBuildingConfidence = confidence >= 0.65 && resultType === 'building';
    const isValid = isHighConfidence || isBuildingConfidence;

    const validatedAddress = {
      housenumber: props.housenumber || housenumber,
      street: props.street || street,
      city: props.city || city,
      state: props.state || state.toUpperCase(),
      postcode: props.postcode || zip,
      country_code: props.country_code || 'US',
      latitude: topResult.geometry?.coordinates?.[1],
      longitude: topResult.geometry?.coordinates?.[0],
      result_type: resultType
    };

    return Response.json({
      valid: isValid,
      confidence: confidence,
      reason: isValid
        ? 'Address verified successfully'
        : confidence < 0.5
        ? 'Address match is too uncertain. Please verify your street address.'
        : 'Partial address match found. Please review and correct if needed.',
      details: validatedAddress
    }, { status: 200 });

  } catch (error) {
    return Response.json({
      valid: false,
      reason: 'Address validation error: ' + error.message,
      confidence: 0,
      details: null
    }, { status: 200 });
  }
});