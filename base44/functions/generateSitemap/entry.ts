import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const baseUrl = 'https://redhelixresearch.com';
    const currentDate = new Date().toISOString().split('T')[0];

    // Core pages with highest SEO priority
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/Products', priority: '0.95', changefreq: 'daily' },
      { url: '/About', priority: '0.8', changefreq: 'monthly' },
      { url: '/Contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/OurStory', priority: '0.8', changefreq: 'monthly' },
    ];

    // Product-specific pages (high priority for conversion)
    const productPages = [
      { url: '/ProductBPC157', priority: '0.9', changefreq: 'weekly' },
      { url: '/ProductTB500', priority: '0.9', changefreq: 'weekly' },
      { url: '/ProductSemaglutide', priority: '0.9', changefreq: 'weekly' },
      { url: '/ProductTirzepatide', priority: '0.9', changefreq: 'weekly' },
    ];

    // Educational & research content (drives organic traffic)
    const educationPages = [
      { url: '/PeptideCalculator', priority: '0.85', changefreq: 'weekly' },
      { url: '/LearnMore', priority: '0.85', changefreq: 'weekly' },
      { url: '/PeptideAcademy', priority: '0.8', changefreq: 'weekly' },
      { url: '/PeptideComparison', priority: '0.85', changefreq: 'weekly' },
      { url: '/PeptideReconstitutionGuide', priority: '0.8', changefreq: 'monthly' },
      { url: '/PeptideReconstitution', priority: '0.8', changefreq: 'monthly' },
      { url: '/PeptideLearn', priority: '0.75', changefreq: 'weekly' },
      { url: '/PeptideInstructions', priority: '0.75', changefreq: 'monthly' },
      { url: '/PeptideCategory', priority: '0.75', changefreq: 'weekly' },
      { url: '/BlogGuide', priority: '0.8', changefreq: 'weekly' },
      { url: '/ResourceHub', priority: '0.75', changefreq: 'weekly' },
      { url: '/GrayMarketInsights', priority: '0.7', changefreq: 'monthly' },
    ];

    // Trust & verification content
    const trustPages = [
      { url: '/COAReports', priority: '0.8', changefreq: 'daily' },
      { url: '/CustomerTestimonials', priority: '0.7', changefreq: 'weekly' },
      { url: '/GroupBuy', priority: '0.7', changefreq: 'weekly' },
    ];

    // Info/legal pages
    const infoPages = [
      { url: '/ExpandedFAQ', priority: '0.7', changefreq: 'monthly' },
      { url: '/Policies', priority: '0.5', changefreq: 'monthly' },
    ];

    const allPages = [
      ...staticPages,
      ...productPages,
      ...educationPages,
      ...trustPages,
      ...infoPages
    ];

    // Generate XML sitemap
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    sitemap += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    for (const page of allPages) {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    }

    sitemap += '</urlset>';

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'X-Robots-Tag': 'noindex'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
