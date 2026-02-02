import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all products for dynamic URLs
    const products = await base44.asServiceRole.entities.Product.list();
    
    const baseUrl = 'https://redhelixresearch.com';
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Static pages with priority and change frequency
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/Home', priority: '1.0', changefreq: 'daily' },
      { url: '/About', priority: '0.8', changefreq: 'weekly' },
      { url: '/Contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/PeptideCalculator', priority: '0.9', changefreq: 'weekly' },
      { url: '/LearnMore', priority: '0.9', changefreq: 'weekly' },
      { url: '/PeptideComparison', priority: '0.9', changefreq: 'weekly' },
      { url: '/BlogGuide', priority: '0.8', changefreq: 'weekly' },
      { url: '/COAReports', priority: '0.8', changefreq: 'daily' },
      { url: '/Cart', priority: '0.7', changefreq: 'daily' },
      { url: '/Account', priority: '0.6', changefreq: 'weekly' },
      { url: '/GroupBuy', priority: '0.7', changefreq: 'weekly' },
      { url: '/OurStory', priority: '0.8', changefreq: 'monthly' },
      { url: '/ExpandedFAQ', priority: '0.7', changefreq: 'monthly' },
      { url: '/Policies', priority: '0.6', changefreq: 'monthly' },
      { url: '/ResourceHub', priority: '0.7', changefreq: 'weekly' },
      { url: '/PeptideReconstitutionGuide', priority: '0.8', changefreq: 'monthly' },
      { url: '/CustomerTestimonials', priority: '0.7', changefreq: 'weekly' }
    ];
    
    // Product-specific pages
    const productPages = [
      { url: '/ProductBPC157', priority: '0.9', changefreq: 'weekly' },
      { url: '/ProductTB500', priority: '0.9', changefreq: 'weekly' },
      { url: '/ProductSemaglutide', priority: '0.9', changefreq: 'weekly' },
      { url: '/ProductTirzepatide', priority: '0.9', changefreq: 'weekly' }
    ];
    
    // Generate XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    for (const page of staticPages) {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    }
    
    // Add product pages
    for (const page of productPages) {
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
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});