import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event } = await req.json();

    if (event.type !== 'create') {
      return Response.json({ success: true });
    }

    const coa = event.data;

    // Create alert for admins
    await base44.asServiceRole.entities.COAAlert.create({
      coa_id: coa.id,
      peptide_name: coa.peptide_name,
      uploaded_by: coa.uploaded_by,
      read: false
    });

    // Send email to site admin
    await base44.integrations.Core.SendEmail({
      to: 'jakehboen95@gmail.com',
      subject: `New COA Submission Pending Approval: ${coa.peptide_name}`,
      body: `A new Certificate of Analysis has been submitted and is pending your approval.

Peptide: ${coa.peptide_name}
Strength: ${coa.peptide_strength}
Uploaded by: ${coa.uploaded_by}

Please log in to the admin panel to review and approve or reject this submission.`
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});