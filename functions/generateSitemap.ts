import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const baseUrl = 'https://redhelixresearch.com';
    
    // Define all pages with priority and change frequency
    const pages = [
      { path: '/', priority: '1.0', changefreq: 'weekly' },
      { path: '/Home', priority: '1.0', changefreq: 'weekly' },
      { path: '/About', priority: '0.9', changefreq: 'monthly' },
      { path: '/Contact', priority: '0.8', changefreq: 'monthly' },
      { path: '/OurStory', priority: '0.8', changefreq: 'monthly' },
      { path: '/LearnMore', priority: '0.9', changefreq: 'weekly' },
      { path: '/BlogGuide', priority: '0.95', changefreq: 'weekly' },
      { path: '/ProductBPC157', priority: '0.95', changefreq: 'weekly' },
      { path: '/ProductTB500', priority: '0.95', changefreq: 'weekly' },
      { path: '/ProductSemaglutide', priority: '0.95', changefreq: 'weekly' },
      { path: '/ProductTirzepatide', priority: '0.95', changefreq: 'weekly' },
      { path: '/PeptideComparison', priority: '0.9', changefreq: 'weekly' },
      { path: '/PeptideCalculator', priority: '0.85', changefreq: 'monthly' },
      { path: '/BacklinkStrategy', priority: '0.7', changefreq: 'monthly' },
      { path: '/InternalLinkingStrategy', priority: '0.7', changefreq: 'monthly' },
      { path: '/SEOGuide', priority: '0.8', changefreq: 'monthly' },
      { path: '/Policies', priority: '0.6', changefreq: 'yearly' },
      { path: '/COAReports', priority: '0.85', changefreq: 'weekly' },
      { path: '/Cart', priority: '0.5', changefreq: 'daily' },
      { path: '/Account', priority: '0.5', changefreq: 'daily' },
      { path: '/GroupBuy', priority: '0.8', changefreq: 'weekly' },
    ];

    // Generate XML sitemap
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    pages.forEach(page => {
      const lastmod = new Date().toISOString().split('T')[0];
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.path}</loc>\n`;
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});