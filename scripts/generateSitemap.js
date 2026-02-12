// Sitemap Generator
// This script is intended to be run during the build process to generate a static sitemap.xml

const generateSitemap = (products, blogPosts) => {
  const baseUrl = 'https://redhelixresearch.com';
  const currentDate = new Date().toISOString();

  const staticPages = [
    '',
    '/home',
    '/products',
    '/peptide-academy',
    '/lab-testing',
    '/contact',
    '/faq',
    '/about-us',
    '/shipping-policy',
    '/refund-policy',
    '/terms-of-service',
    '/privacy-policy'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Add Static Pages
  staticPages.forEach(page => {
    xml += `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>
`;
  });

  // Add Product Pages
  // Note: In a real build, you would fetch these from your data source
  // For this implementation, we'll assume a list of known product IDs
  const productIds = [
    'bpc-157', 'tb-500', 'semaglutide', 'tirzepatide', 'pt-141', 
    'dsip', 'epitalon', 'cjc-1295', 'ipamorelin', 'ghk-cu'
  ];

  productIds.forEach(id => {
    xml += `  <url>
    <loc>${baseUrl}/product/${id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  });

  // Add Research Guide Pages
  const guidePages = [
    'peptide-reconstitution-guide',
    'peptide-dosage-calculator',
    'research-protocols'
  ];

  guidePages.forEach(page => {
    xml += `  <url>
    <loc>${baseUrl}/guides/${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });

  xml += '</urlset>';
  return xml;
};

// If running in Node environment (during build)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateSitemap };
}
