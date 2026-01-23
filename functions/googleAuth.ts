import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { idToken } = await req.json();

    if (!idToken) {
      return Response.json({ error: 'ID token required' }, { status: 400 });
    }

    // Get access token from Google connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    // Verify the ID token with Google
    const verifyResponse = await fetch('https://oauth2.googleapis.com/tokeninfo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `id_token=${idToken}`
    });

    if (!verifyResponse.ok) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const tokenData = await verifyResponse.json();
    const { email, name, picture } = tokenData;

    if (!email) {
      return Response.json({ error: 'Email not provided by Google' }, { status: 400 });
    }

    // Create or update user in Base44
    try {
      // Try to get existing user
      const users = await base44.asServiceRole.entities.User.list();
      let user = users.find(u => u.email === email);

      if (!user) {
        // Invite user with Google details
        await base44.users.inviteUser(email, 'user');
        // Fetch the newly created user
        const allUsers = await base44.asServiceRole.entities.User.list();
        user = allUsers.find(u => u.email === email);
      }

      // Update user with Google info
      if (user) {
        await base44.asServiceRole.entities.User.update(user.id, {
          full_name: name || user.full_name,
          google_id: tokenData.sub,
          avatar_url: picture
        });
      }

      return Response.json({ success: true, email, name });
    } catch (err) {
      console.error('User creation error:', err);
      return Response.json({ error: 'Failed to process user', details: err.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});