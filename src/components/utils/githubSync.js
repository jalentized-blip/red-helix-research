/**
 * GitHub Sync for Affiliate Data
 *
 * Automatically commits changes to the HARDCODED_AFFILIATES array
 * in affiliateStore.js when affiliates are added or deleted via the admin dashboard.
 */

const REPO_OWNER = 'jalentized-blip';
const REPO_NAME = 'red-helix-research';
const FILE_PATH = 'src/components/utils/affiliateStore.js';
const API_BASE = 'https://api.github.com';
const PAT_STORAGE_KEY = 'rdr_github_pat';

/**
 * Get the GitHub token — checks env var first, then localStorage.
 * Resolved dynamically each call so admin can set it at runtime.
 */
function getToken() {
  return import.meta.env.VITE_GITHUB_PAT || localStorage.getItem(PAT_STORAGE_KEY) || '';
}

/** Save a GitHub PAT to localStorage (for admin setup on deployed site). */
export function saveGitHubToken(token) {
  localStorage.setItem(PAT_STORAGE_KEY, token);
}

/** Check if a GitHub PAT is configured. */
export function hasGitHubToken() {
  return !!getToken();
}

/**
 * Build a clean JS string for a single affiliate object (source-code format).
 * Only includes identity/config fields — stats default to 0 in source code.
 */
function affiliateToSourceCode(aff, indent = '  ') {
  const id = (aff.id || '').replace(/'/g, "\\'");
  const code = (aff.code || '').replace(/'/g, "\\'");
  const name = (aff.affiliate_name || '').replace(/'/g, "\\'");
  const email = (aff.affiliate_email || '').replace(/'/g, "\\'");
  const discount = aff.discount_percent ?? 10;
  const commission = aff.commission_percent ?? 10;
  const active = aff.is_active !== false;

  return [
    `${indent}{`,
    `${indent}  id: '${id}',`,
    `${indent}  code: '${code}',`,
    `${indent}  affiliate_name: '${name}',`,
    `${indent}  affiliate_email: '${email}',`,
    `${indent}  discount_percent: ${discount},`,
    `${indent}  commission_percent: ${commission},`,
    `${indent}  is_active: ${active},`,
    `${indent}  total_points: 0,`,
    `${indent}  total_commission: 0,`,
    `${indent}  total_orders: 0,`,
    `${indent}  total_revenue: 0,`,
    `${indent}},`,
  ].join('\n');
}

/**
 * Build the full HARDCODED_AFFILIATES array block as it should appear in source.
 */
function buildAffiliatesArraySource(affiliates) {
  if (!affiliates || affiliates.length === 0) {
    return 'const HARDCODED_AFFILIATES = [];';
  }

  const entries = affiliates.map(aff => affiliateToSourceCode(aff)).join('\n');

  return `const HARDCODED_AFFILIATES = [\n${entries}\n];`;
}

/**
 * Fetch the current file from GitHub (content + SHA needed for updates).
 */
async function getFileFromGitHub() {
  const url = `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${getToken()}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GitHub GET failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  // GitHub returns base64-encoded content
  const content = atob(data.content.replace(/\n/g, ''));
  return { content, sha: data.sha };
}

/**
 * Commit updated file content to GitHub.
 */
async function putFileToGitHub(newContent, sha, commitMessage) {
  const url = `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${getToken()}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: btoa(unescape(encodeURIComponent(newContent))),
      sha,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GitHub PUT failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Sync the current affiliates list to GitHub by updating the HARDCODED_AFFILIATES array.
 *
 * @param {Array} affiliates - The full list of affiliates to persist in source code
 * @param {string} action - Description for the commit message (e.g., "add MELISSA10", "remove JOHN15")
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function syncAffiliatesToGitHub(affiliates, action = 'update') {
  try {
    if (!getToken()) {
      return { success: false, message: 'No GitHub token configured. Set one in Admin Settings.' };
    }

    // 1. Get current file from GitHub
    const { content, sha } = await getFileFromGitHub();

    // 2. Find and replace the HARDCODED_AFFILIATES array
    const arrayRegex = /const HARDCODED_AFFILIATES = \[[\s\S]*?\n\];/;
    const match = content.match(arrayRegex);

    if (!match) {
      throw new Error('Could not find HARDCODED_AFFILIATES array in source file');
    }

    // 3. Build the new array source code
    const newArraySource = buildAffiliatesArraySource(affiliates);

    // 4. Replace in file
    const newContent = content.replace(arrayRegex, newArraySource);

    // 5. Commit to GitHub
    const commitMessage = `chore(affiliates): ${action}`;
    await putFileToGitHub(newContent, sha, commitMessage);

    console.log(`[GitHubSync] Successfully committed: ${commitMessage}`);
    return { success: true, message: `Synced to GitHub: ${action}` };
  } catch (error) {
    console.error('[GitHubSync] Failed:', error);
    return { success: false, message: error.message || 'GitHub sync failed' };
  }
}
