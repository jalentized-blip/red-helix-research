import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'Missing file_url' }, { status: 400 });
    }

    // Use InvokeLLM to verify COA presence in image/PDF
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a pharmaceutical document verification specialist. Analyze this image/document and determine if it contains a Certificate of Analysis (COA), Certificate of Authenticity, or similar pharmaceutical test report.

Look for:
- Test results or analysis data
- Chemical compound information
- Purity percentages
- Lab testing information
- Quality assurance marks
- Test dates
- Lab certifications

Respond with ONLY a JSON object:
{"is_valid_coa": true/false, "confidence": 0-100, "reason": "brief explanation"}`,
      add_context_from_internet: false,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          is_valid_coa: { type: "boolean" },
          confidence: { type: "number" },
          reason: { type: "string" }
        },
        required: ["is_valid_coa", "confidence", "reason"]
      }
    });

    return Response.json(response);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});