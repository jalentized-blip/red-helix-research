/**
 * exportCOAData — Owner-only COA migration download
 * Exports all COA records (UserCOA + COA entities) with full metadata,
 * image URLs, and setup instructions for rebuilding on a new platform.
 *
 * Hard-locked to owner email. Delete after downloading.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const OWNER_EMAIL = 'jalentized@gmail.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin' || user.email !== OWNER_EMAIL) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Paginate helper
    const fetchAll = async (entity) => {
      const results = [];
      let skip = 0;
      const limit = 100;
      while (true) {
        const batch = await base44.asServiceRole.entities[entity].list(undefined, limit, skip);
        if (!batch || batch.length === 0) break;
        results.push(...batch);
        if (batch.length < limit) break;
        skip += limit;
      }
      return results;
    };

    const [userCOAs, adminCOAs] = await Promise.all([
      fetchAll('UserCOA'),
      fetchAll('COA'),
    ]);

    const exportedAt = new Date().toISOString();

    const payload = {
      _meta: {
        title: "Red Helix Research — COA Migration Export",
        exported_at: exportedAt,
        exported_by: user.email,
        warning: "OWNER ONLY. Delete after transferring. Contains all COA image URLs and metadata.",
        counts: {
          user_coas: userCOAs.length,
          admin_coas: adminCOAs.length,
          total: userCOAs.length + adminCOAs.length,
        },
      },

      // ─── ENTITY 1: UserCOA — Community uploaded COAs ───────────────────────────
      user_coas: {
        _description: "Community-submitted COAs. Stored in the UserCOA entity. These appear on the /COAReports page. Approved ones are public, unapproved are admin-only.",
        _entity_schema: {
          peptide_name: "string — name of the peptide (e.g. BPC-157)",
          peptide_strength: "string — concentration/dosage (e.g. 5mg)",
          coa_image_url: "string — URL to the uploaded COA image or PDF (hosted on Base44 storage)",
          coa_link: "string (optional) — direct link to external lab verification",
          verified: "boolean — whether the COA passed verification",
          uploaded_by: "string — email of uploader",
          approved: "boolean — admin approval to show publicly",
          is_from_barn: "boolean — whether it's a Red Helix verified COA",
          batch_number: "string (optional) — batch/lot number",
          id: "string — auto-generated record ID",
          created_date: "ISO datetime",
          updated_date: "ISO datetime",
        },
        _image_hosting_note: "All coa_image_url values point to Base44 storage (media.base44.com). You MUST download each image/PDF and re-upload to your new platform's storage, then update the URLs in your new database.",
        records: userCOAs,
      },

      // ─── ENTITY 2: COA — Admin-managed COAs ───────────────────────────────────
      admin_coas: {
        _description: "Admin-uploaded COAs from the COA entity (separate from UserCOA). These are the official product COAs managed directly by admin.",
        _entity_schema: {
          product_name: "string — name of the product this COA is for",
          image_url: "string — URL to the COA certificate image",
          batch_number: "string — batch number",
          test_date: "date string (YYYY-MM-DD) — date the product was tested",
          id: "string",
          created_date: "ISO datetime",
        },
        records: adminCOAs,
      },

      // ─── ALL IMAGE URLS (flat list for easy bulk download) ────────────────────
      all_image_urls: {
        _description: "Flat list of every COA image/PDF URL for easy bulk downloading. Use a download manager or script to grab all files before your old platform shuts down.",
        _script_example: `
# Python script to download all COA files:
# pip install requests
import requests, os
urls = [
  # paste the urls array here
]
os.makedirs('coa_downloads', exist_ok=True)
for i, url in enumerate(urls):
    ext = '.pdf' if '.pdf' in url.lower() else '.png'
    r = requests.get(url, timeout=30)
    with open(f'coa_downloads/coa_{i+1}{ext}', 'wb') as f:
        f.write(r.content)
    print(f'Downloaded {i+1}/{len(urls)}: {url}')
print('Done!')
        `.trim(),
        user_coa_images: userCOAs
          .filter(c => c.coa_image_url)
          .map(c => ({
            id: c.id,
            peptide_name: c.peptide_name,
            peptide_strength: c.peptide_strength,
            batch_number: c.batch_number || null,
            approved: c.approved,
            url: c.coa_image_url,
            external_link: c.coa_link || null,
          })),
        admin_coa_images: adminCOAs
          .filter(c => c.image_url)
          .map(c => ({
            id: c.id,
            product_name: c.product_name,
            batch_number: c.batch_number || null,
            test_date: c.test_date || null,
            url: c.image_url,
          })),
      },

      // ─── MIGRATION INSTRUCTIONS ───────────────────────────────────────────────
      migration_instructions: {
        step_1_download_images: {
          description: "Download all COA images/PDFs from Base44 storage BEFORE migrating. These URLs will stop working once you leave Base44.",
          all_urls: [
            ...userCOAs.filter(c => c.coa_image_url).map(c => c.coa_image_url),
            ...adminCOAs.filter(c => c.image_url).map(c => c.image_url),
          ].filter((v, i, a) => a.indexOf(v) === i), // deduplicate
        },
        step_2_upload_to_new_platform: "Re-upload each downloaded image to your new platform's file storage (S3, Cloudflare R2, Supabase Storage, etc.)",
        step_3_recreate_entities: {
          description: "Create two entities on your new platform: UserCOA and COA (or equivalent). See schemas above.",
          import_order: "Import admin_coas first (COA entity), then user_coas (UserCOA entity)",
          id_note: "The 'id' field will be auto-generated by your new platform — you don't need to preserve the old IDs unless you have direct links to specific COAs.",
        },
        step_4_update_image_urls: "After uploading to new storage, update every coa_image_url and image_url with the new storage URLs before importing records.",
        step_5_update_coa_reports_page: {
          file: "pages/COAReports.jsx",
          entity_used: "UserCOA (base44.entities.UserCOA.list('-created_date'))",
          approval_logic: "Admin sees all COAs. Regular users only see records where approved === true.",
          upload_flow: "components/COA/UploadCOAModal.jsx — handles file upload → AI verification → metadata form → creates UserCOA record",
          edit_flow: "components/COA/EditCOAModal.jsx — admin can edit existing COA records",
          ai_verification: "On upload, calls verifyCOA backend function (functions/verifyCOA.js) which uses AI to confirm the uploaded file is actually a COA document. Then calls InvokeLLM to auto-extract peptide name and strength.",
          admin_notification: "functions/coaSubmissionAlert.js — sends admin email when a new COA is submitted for approval",
        },
        step_6_zelle_qr_note: "The Zelle QR image is hosted separately — see AdminPaymentAssetsExport for that.",
        frontend_share_links: "COAReports page supports ?coa=RECORD_ID in URL to auto-scroll to a specific COA. If you preserve record IDs this works automatically; otherwise you'll need to update any shared links.",
      },

      // ─── COA PAGE CODE SUMMARY ────────────────────────────────────────────────
      code_reference: {
        pages: {
          "pages/COAReports.jsx": "Main public COA listing page. Fetches UserCOA entity, filters by approved status for non-admins. Admin controls: approve, reject, delete, edit, bulk-delete, select-all.",
        },
        components: {
          "components/COA/UploadCOAModal.jsx": "3-step upload modal: (1) file upload + AI verification via verifyCOA function, (2) show verification result, (3) metadata form. Creates UserCOA record.",
          "components/COA/EditCOAModal.jsx": "Admin modal to edit existing UserCOA records (peptide_name, strength, coa_link, batch_number, approved status).",
        },
        backend_functions: {
          "functions/verifyCOA.js": "AI-powered COA verification — checks if uploaded file is actually a valid COA document. Returns is_valid_coa, confidence (0-100), reason.",
          "functions/coaSubmissionAlert.js": "Sends admin email notification when a new COA is submitted pending approval.",
        },
        entities: {
          UserCOA: "Community COAs — public facing with approval workflow",
          COA: "Admin COAs — official product certificates (simpler, no approval workflow)",
        },
        ai_extraction: {
          trigger: "After verifyCOA passes (confidence >= 70), InvokeLLM auto-extracts peptide_name and peptide_strength from the COA image",
          prompt_location: "components/COA/UploadCOAModal.jsx handleProceedToDetails()",
        },
      },
    };

    const json = JSON.stringify(payload, null, 2);
    const bytes = new TextEncoder().encode(json);

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=RHR_COAExport_${new Date().toISOString().slice(0, 10)}.json`,
        'Content-Length': bytes.byteLength.toString(),
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});