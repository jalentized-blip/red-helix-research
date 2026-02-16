/**
 * Prerender Script for Red Helix Research
 *
 * Generates static HTML files for each public route with:
 * - Per-page <title>, <meta description>, Open Graph, Twitter Card
 * - Per-page JSON-LD structured data
 * - Static content visible to crawlers before JS loads
 * - Proper canonical URLs
 *
 * Run after `vite build`: node scripts/prerender.js
 *
 * This replaces the single index.html shell with unique HTML for each route,
 * ensuring crawlers (Googlebot, Bingbot, social media) see page-specific content
 * even without executing JavaScript.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, '..', 'dist');
const SITE_URL = 'https://redhelixresearch.com';
const SITE_NAME = 'Red Helix Research';
const LOGO_URL = 'https://i.ibb.co/M5CYvjkG/websitelogo.png';

// ─── PAGE SEO DATA ───
// Each public route with its unique meta tags and content
const PAGES = [
  {
    route: '/',
    title: 'Red Helix Research | Premium Research Peptides USA — Lab-Tested & COA Verified',
    description: 'Buy premium research-grade peptides from Red Helix Research. HPLC-verified BPC-157, TB-500, Semaglutide, Tirzepatide with third-party COA. USA-based supplier.',
    keywords: 'research peptides USA, buy research peptides, peptide supplier, BPC-157, TB-500, semaglutide, tirzepatide, COA verified peptides, lab-tested peptides',
    content: `<h1>Red Helix Research — Premium Research Peptides USA</h1>
      <p>USA-based supplier of HPLC-verified, lab-tested research peptides with third-party Certificates of Analysis. For research use only.</p>
      <h2>Featured Research Peptides</h2>
      <ul>
        <li><a href="/ProductBPC157">BPC-157 (Body Protection Compound-157)</a> — From $44.99</li>
        <li><a href="/ProductTB500">TB-500 (Thymosin Beta-4)</a> — From $59.99</li>
        <li><a href="/ProductSemaglutide">Semaglutide (GLP-1 Agonist)</a> — From $89.99</li>
        <li><a href="/ProductTirzepatide">Tirzepatide (Dual GLP-1/GIP)</a> — From $119.99</li>
        <li><a href="/Products">View All 29+ Peptides →</a></li>
      </ul>`,
  },
  {
    route: '/Products',
    title: 'Buy Research Peptides Online — 29+ HPLC-Verified Compounds | USA Supplier',
    description: 'Browse 29+ research-grade peptides including BPC-157, TB-500, Semaglutide, Tirzepatide. All lab-tested with third-party COA. Free shipping on orders over $200.',
    keywords: 'buy research peptides, research peptides for sale, peptide catalog, BPC-157, TB-500, semaglutide, tirzepatide, research chemicals USA',
    content: `<h1>Research Peptides Catalog — 29+ HPLC-Verified Compounds</h1>
      <p>Browse our complete catalog of research-grade peptides. Every product includes third-party Certificate of Analysis.</p>
      <h2>Product Categories</h2>
      <ul>
        <li>Weight Loss &amp; Metabolic — Semaglutide, Tirzepatide, Retatrutide</li>
        <li>Recovery &amp; Healing — BPC-157, TB-500, GHK-Cu</li>
        <li>Cognitive &amp; Focus — Semax, Selank, Pinealon</li>
        <li>Performance &amp; Longevity — CJC-1295, Ipamorelin, MOTS-c, Epithalon</li>
        <li>Sexual Health — PT-141, Kisspeptin, Melanotan</li>
        <li>Immune Support — Thymosin Alpha-1, LL-37</li>
      </ul>`,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Research Peptides Catalog',
      description: 'Browse 29+ research-grade peptides with HPLC-verified purity and third-party COA.',
      url: `${SITE_URL}/Products`,
    },
  },
  {
    route: '/ProductBPC157',
    title: 'Buy BPC-157 Peptide — Lab-Tested 5mg, 10mg, 50mg | USA Supplier',
    description: 'Buy BPC-157 Body Protection Compound-157 from $44.99. HPLC-verified >98% purity with third-party COA. 5mg, 10mg, and 50mg bulk. USA-based research peptide supplier.',
    keywords: 'buy BPC-157, BPC-157 peptide, body protection compound 157, BPC-157 5mg, BPC-157 10mg, BPC-157 for sale, BPC-157 USA, BPC-157 purity, BPC-157 COA',
    content: `<h1>BPC-157 — Body Protection Compound-157 Research Peptide</h1>
      <p>Research-grade BPC-157 peptide with HPLC-verified purity >98%. Available in 5mg, 10mg, and 50mg vials.</p>
      <ul>
        <li>15 amino acid peptide sequence</li>
        <li>Third-party Certificate of Analysis included</li>
        <li>HPLC purity verification >98%</li>
        <li>USA-based shipping</li>
      </ul>
      <p><a href="/Products">Browse All Peptides</a> | <a href="/PeptideComparison">Compare BPC-157 vs TB-500</a> | <a href="/COAReports">View COA Reports</a></p>`,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'BPC-157 Research Peptide',
      description: 'Research-grade BPC-157 Body Protection Compound-157 peptide — HPLC verified, lab-tested with third-party COA.',
      brand: { '@type': 'Brand', name: SITE_NAME },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '44.99',
        highPrice: '399.99',
        availability: 'https://schema.org/InStock',
      },
    },
  },
  {
    route: '/ProductTB500',
    title: 'Buy TB-500 (Thymosin Beta-4) — Lab-Tested 5mg, 10mg, 50mg | USA Supplier',
    description: 'Buy TB-500 Thymosin Beta-4 from $59.99. HPLC-verified >98.5% purity with third-party COA. 5mg, 10mg, and 50mg bulk. USA-based research peptide supplier.',
    keywords: 'buy TB-500, TB-500 peptide, thymosin beta 4, TB-500 5mg, TB-500 10mg, TB-500 for sale, TB-500 USA, TB-500 purity, TB-500 COA',
    content: `<h1>TB-500 — Thymosin Beta-4 Research Peptide</h1>
      <p>Research-grade TB-500 peptide with HPLC-verified purity >98.5%. Available in 5mg, 10mg, and 50mg vials.</p>
      <ul>
        <li>43 amino acid peptide sequence</li>
        <li>Third-party Certificate of Analysis included</li>
        <li>HPLC purity verification >98.5%</li>
        <li>USA-based shipping</li>
      </ul>
      <p><a href="/Products">Browse All Peptides</a> | <a href="/PeptideComparison">Compare TB-500 vs BPC-157</a> | <a href="/COAReports">View COA Reports</a></p>`,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'TB-500 Thymosin Beta-4 Research Peptide',
      description: 'Research-grade TB-500 Thymosin Beta-4 peptide — HPLC verified, lab-tested with third-party COA.',
      brand: { '@type': 'Brand', name: SITE_NAME },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '59.99',
        highPrice: '449.99',
        availability: 'https://schema.org/InStock',
      },
    },
  },
  {
    route: '/ProductSemaglutide',
    title: 'Buy Semaglutide Research Peptide — GLP-1 Agonist | Lab-Tested USA',
    description: 'Buy Semaglutide GLP-1 receptor agonist for research. HPLC-verified purity with third-party COA. Multiple vial sizes available. USA-based supplier.',
    keywords: 'buy semaglutide, semaglutide research peptide, GLP-1 agonist, semaglutide for sale, semaglutide USA, semaglutide purity, semaglutide COA',
    content: `<h1>Semaglutide — GLP-1 Receptor Agonist Research Peptide</h1>
      <p>Research-grade Semaglutide for metabolic research. HPLC-verified purity with third-party COA.</p>
      <p><a href="/Products">Browse All Peptides</a> | <a href="/PeptideComparison">Compare Semaglutide vs Tirzepatide</a> | <a href="/COAReports">View COA Reports</a></p>`,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Semaglutide Research Peptide',
      description: 'Research-grade Semaglutide GLP-1 receptor agonist — HPLC verified with third-party COA.',
      brand: { '@type': 'Brand', name: SITE_NAME },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '89.99',
        availability: 'https://schema.org/InStock',
      },
    },
  },
  {
    route: '/ProductTirzepatide',
    title: 'Buy Tirzepatide Research Peptide — Dual GLP-1/GIP Agonist | Lab-Tested USA',
    description: 'Buy Tirzepatide dual GLP-1/GIP receptor agonist for research. HPLC-verified purity with third-party COA. USA-based peptide supplier.',
    keywords: 'buy tirzepatide, tirzepatide research peptide, GLP-1 GIP agonist, tirzepatide for sale, tirzepatide USA, tirzepatide purity, tirzepatide COA',
    content: `<h1>Tirzepatide — Dual GLP-1/GIP Receptor Agonist Research Peptide</h1>
      <p>Research-grade Tirzepatide for metabolic research. Dual-action GLP-1/GIP agonist with HPLC-verified purity.</p>
      <p><a href="/Products">Browse All Peptides</a> | <a href="/PeptideComparison">Compare Tirzepatide vs Semaglutide</a> | <a href="/COAReports">View COA Reports</a></p>`,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Tirzepatide Research Peptide',
      description: 'Research-grade Tirzepatide dual GLP-1/GIP receptor agonist — HPLC verified with third-party COA.',
      brand: { '@type': 'Brand', name: SITE_NAME },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '119.99',
        availability: 'https://schema.org/InStock',
      },
    },
  },
  {
    route: '/About',
    title: 'About Red Helix Research — USA Research Peptide Supplier',
    description: 'Learn about Red Helix Research\'s commitment to transparency, quality, and affordable research peptides with verified COAs. Founded 2024.',
    keywords: 'about Red Helix Research, peptide supplier USA, research peptide company, peptide quality',
    content: `<h1>About Red Helix Research</h1>
      <p>Red Helix Research is a USA-based supplier of premium research-grade peptides committed to transparency, quality, and affordability.</p>
      <p><a href="/Products">Browse Products</a> | <a href="/COAReports">View COA Reports</a> | <a href="/Contact">Contact Us</a></p>`,
  },
  {
    route: '/Contact',
    title: 'Contact Red Helix Research — Research Peptide Inquiries & Support',
    description: 'Get in touch with Red Helix Research for research peptide inquiries, support, and wholesale orders. Email: jake@redhelixresearch.com',
    keywords: 'contact Red Helix Research, peptide support, wholesale peptides, research peptide inquiries',
    content: `<h1>Contact Red Helix Research</h1>
      <p>Email: jake@redhelixresearch.com</p>
      <p>Discord: <a href="https://discord.gg/BwQHufvmQ8">Join Our Community</a></p>
      <p>Telegram: <a href="https://t.me/Redhelixresearch">@Redhelixresearch</a></p>`,
  },
  {
    route: '/BlogGuide',
    title: 'Research Peptide Guides — 23+ In-Depth Articles on BPC-157, TB-500 & More',
    description: 'Comprehensive research peptide guides covering BPC-157, TB-500, Semaglutide, Tirzepatide mechanisms, protocols, and clinical references.',
    keywords: 'peptide research guides, BPC-157 guide, TB-500 guide, semaglutide research, peptide education',
    content: `<h1>Research Peptide Guides & Education</h1>
      <p>23+ in-depth research articles covering peptide mechanisms, clinical references, and research protocols.</p>
      <ul>
        <li><a href="/PeptideGlossary">Peptide Glossary — 40+ Research Terms</a></li>
        <li><a href="/PeptideAcademy">Free Peptide Academy</a></li>
        <li><a href="/PeptideReconstitutionGuide">Reconstitution Guide</a></li>
        <li><a href="/PeptideComparison">Peptide Comparison Tool</a></li>
      </ul>`,
  },
  {
    route: '/PeptideGlossary',
    title: 'Peptide Glossary — 40+ Research Terms & Definitions | Red Helix Research',
    description: 'Comprehensive peptide glossary covering HPLC, lyophilization, amino acids, BPC-157, reconstitution, and 40+ research terms with definitions.',
    keywords: 'peptide glossary, what is BPC-157, HPLC meaning, peptide terms, peptide definitions, lyophilization, reconstitution',
    content: `<h1>Peptide Research Glossary</h1>
      <p>40+ searchable research terms and definitions for peptide science.</p>`,
  },
  {
    route: '/PeptideCalculator',
    title: 'Peptide Reconstitution Calculator — Free Dosage Tool | Red Helix Research',
    description: 'Free peptide reconstitution calculator. Calculate exact volumes, concentrations, and dosages for BPC-157, TB-500, Semaglutide, and more.',
    keywords: 'peptide calculator, reconstitution calculator, peptide dosage calculator, BPC-157 dosage, TB-500 dosage',
    content: `<h1>Peptide Reconstitution Calculator</h1>
      <p>Free tool to calculate exact reconstitution volumes and concentrations for research peptides.</p>`,
  },
  {
    route: '/PeptideComparison',
    title: 'BPC-157 vs TB-500 vs Semaglutide vs Tirzepatide — Peptide Comparison',
    description: 'Compare research peptides side-by-side. BPC-157 vs TB-500, Semaglutide vs Tirzepatide — molecular weight, purity, pricing, and research applications.',
    keywords: 'BPC-157 vs TB-500, semaglutide vs tirzepatide, peptide comparison, compare peptides',
    content: `<h1>Research Peptide Comparison Tool</h1>
      <p>Compare peptides side-by-side including BPC-157, TB-500, Semaglutide, and Tirzepatide.</p>`,
  },
  {
    route: '/PeptideAcademy',
    title: 'Peptide Academy — Free Research Peptide Education & Training',
    description: 'Free peptide education modules covering peptide science fundamentals, reconstitution, storage, and research protocols.',
    keywords: 'peptide academy, peptide education, learn about peptides, peptide training, peptide course',
    content: `<h1>Peptide Academy — Free Learning Modules</h1>
      <p>Self-paced educational modules on peptide science, reconstitution, and research protocols.</p>`,
  },
  {
    route: '/COAReports',
    title: 'Certificate of Analysis (COA) Reports — Third-Party Lab Testing Results',
    description: 'View third-party Certificate of Analysis reports for all Red Helix Research peptides. HPLC purity, mass spectrometry, and endotoxin testing results.',
    keywords: 'COA reports, certificate of analysis, peptide testing, HPLC results, lab testing, peptide purity',
    content: `<h1>Certificate of Analysis Reports</h1>
      <p>Third-party lab testing results for all research peptides. Every batch verified for purity via HPLC and mass spectrometry.</p>`,
  },
  {
    route: '/ExpandedFAQ',
    title: 'Research Peptide FAQ — Ordering, Quality, Shipping & Reconstitution',
    description: 'Frequently asked questions about Red Helix Research peptides. Ordering, payment, shipping, quality testing, reconstitution, and storage.',
    keywords: 'peptide FAQ, peptide questions, ordering peptides, peptide shipping, peptide storage',
    content: `<h1>Frequently Asked Questions</h1>
      <p>Common questions about ordering, payment, shipping, quality, and reconstitution of research peptides.</p>`,
  },
  {
    route: '/LearnMore',
    title: 'Peptide Research Database — Scientific Studies & Product Information',
    description: 'Research database with scientific studies, mechanisms of action, and product information for 29+ research peptides.',
    keywords: 'peptide research, peptide studies, peptide mechanisms, peptide science, research database',
    content: `<h1>Peptide Research & Education</h1>
      <p>Comprehensive research database with scientific studies and product information.</p>`,
  },
  {
    route: '/PeptideReconstitutionGuide',
    title: 'Peptide Reconstitution Guide — Step-by-Step Instructions',
    description: 'Complete guide to reconstituting research peptides. Step-by-step instructions for BPC-157, TB-500, Semaglutide using bacteriostatic water.',
    keywords: 'peptide reconstitution, how to reconstitute peptides, bacteriostatic water, peptide mixing guide',
    content: `<h1>Peptide Reconstitution Guide</h1>
      <p>Step-by-step guide for properly reconstituting lyophilized research peptides with bacteriostatic water.</p>`,
  },
  {
    route: '/OurStory',
    title: 'Our Story — Red Helix Research',
    description: 'The story behind Red Helix Research. How we became a trusted USA-based research peptide supplier.',
    keywords: 'Red Helix Research story, peptide company history, about us',
    content: `<h1>Our Story</h1><p>Learn how Red Helix Research was founded with a mission to provide affordable, high-quality research peptides.</p>`,
  },
  {
    route: '/CustomerTestimonials',
    title: 'Customer Testimonials — Red Helix Research Reviews',
    description: 'Read verified customer testimonials and reviews for Red Helix Research peptides.',
    keywords: 'Red Helix Research reviews, peptide reviews, customer testimonials',
    content: `<h1>Customer Testimonials</h1><p>Read what our customers say about Red Helix Research peptides.</p>`,
  },
  {
    route: '/GroupBuy',
    title: 'Group Buy — Bulk Research Peptide Discounts',
    description: 'Join group buys for discounted bulk research peptides. Save on BPC-157, TB-500, Semaglutide and more.',
    keywords: 'group buy peptides, bulk peptides, wholesale peptides, peptide discounts',
    content: `<h1>Group Buy — Bulk Discounts</h1><p>Join community group buys for discounted research peptide pricing.</p>`,
  },
  {
    route: '/ResourceHub',
    title: 'Resource Hub — Research Peptide Tools & Guides',
    description: 'Central hub for research peptide tools, guides, calculators, and educational resources.',
    keywords: 'peptide resources, research tools, peptide guides, peptide calculator',
    content: `<h1>Resource Hub</h1><p>All research peptide tools and educational resources in one place.</p>`,
  },
  {
    route: '/Policies',
    title: 'Policies & Terms — Red Helix Research',
    description: 'Red Helix Research policies including terms of service, privacy policy, refund policy, and shipping information.',
    keywords: 'terms of service, privacy policy, refund policy, shipping policy, peptide policies',
    content: `<h1>Policies & Terms</h1><p>Review our terms of service, privacy policy, refund policy, and shipping information.</p>`,
  },
];

// ─── HTML GENERATOR ───
function generateHTML(templateHTML, page) {
  let html = templateHTML;

  const fullTitle = page.title.includes(SITE_NAME) ? page.title : `${page.title} | ${SITE_NAME}`;
  const canonical = `${SITE_URL}${page.route === '/' ? '/' : page.route}`;
  const description = page.description.length > 160 ? page.description.substring(0, 157) + '...' : page.description;

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${fullTitle}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${description}"`
  );

  // Replace meta keywords
  html = html.replace(
    /<meta name="keywords" content="[^"]*"/,
    `<meta name="keywords" content="${page.keywords}"`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${canonical}"`
  );

  // Replace OG tags
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${canonical}"`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${fullTitle}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${description}"`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${fullTitle}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${description}"`
  );

  // Replace hreflang
  html = html.replace(
    /<link rel="alternate" hreflang="en-us" href="[^"]*"/,
    `<link rel="alternate" hreflang="en-us" href="${canonical}"`
  );
  html = html.replace(
    /<link rel="alternate" hreflang="x-default" href="[^"]*"/,
    `<link rel="alternate" hreflang="x-default" href="${canonical}"`
  );

  // Add page-specific schema if provided
  if (page.schema) {
    const schemaScript = `\n    <script type="application/ld+json">\n    ${JSON.stringify(page.schema, null, 2)}\n    </script>`;
    html = html.replace('</head>', `${schemaScript}\n  </head>`);
  }

  // Replace noscript content with page-specific content
  if (page.content) {
    const noscriptContent = `<noscript>
      <div style="max-width:900px;margin:40px auto;padding:20px;font-family:system-ui,sans-serif;color:#1e293b;">
        ${page.content}
        <hr style="margin:20px 0;border:0;border-top:1px solid #e2e8f0;">
        <p><a href="/">Home</a> | <a href="/Products">Products</a> | <a href="/About">About</a> | <a href="/Contact">Contact</a> | <a href="/ExpandedFAQ">FAQ</a></p>
        <p><strong>Disclaimer:</strong> All products are sold for laboratory research purposes only. Not for human consumption.</p>
        <p>Contact: jake@redhelixresearch.com</p>
      </div>
    </noscript>`;

    html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, noscriptContent);
  }

  return html;
}

// ─── MAIN ───
function main() {
  const indexPath = resolve(DIST_DIR, 'index.html');

  if (!existsSync(indexPath)) {
    console.error('❌ dist/index.html not found. Run `vite build` first.');
    process.exit(1);
  }

  const templateHTML = readFileSync(indexPath, 'utf-8');
  let generated = 0;

  for (const page of PAGES) {
    const html = generateHTML(templateHTML, page);

    if (page.route === '/') {
      // Overwrite the root index.html
      writeFileSync(indexPath, html, 'utf-8');
      console.log(`  ✓ / (index.html)`);
    } else {
      // Create /Route/index.html for clean URLs
      const routeDir = resolve(DIST_DIR, page.route.replace(/^\//, ''));
      if (!existsSync(routeDir)) {
        mkdirSync(routeDir, { recursive: true });
      }
      writeFileSync(resolve(routeDir, 'index.html'), html, 'utf-8');
      console.log(`  ✓ ${page.route}/index.html`);
    }
    generated++;
  }

  console.log(`\n✅ Pre-rendered ${generated} pages with unique meta tags and content.`);
  console.log('   Crawlers will now see page-specific titles, descriptions, and structured data.');
}

main();
