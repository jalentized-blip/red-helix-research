import React from 'react';
import { Helmet } from 'react-helmet';

export default function SEO({ 
  title = 'Red Helix Research - Research Peptides USA | Lab-Tested Gray Market Supplier',
  description = 'Buy research peptides USA with verified COA. Premium research-grade peptides for lab research. High purity semaglutide, tirzepatide, BPC-157, TB-500. Lab tested with transparent third-party verification.',
  keywords = 'research peptides USA, buy research peptides, research peptides, peptide supplier USA, high purity peptides, lab tested peptides, research grade peptides, peptide vendor, BPC-157, TB-500, semaglutide research, tirzepatide research, research chemicals',
  canonical,
  schema,
  image = 'https://i.ibb.co/M5CYvjkG/websitelogo.png'
}) {
  const url = canonical || (typeof window !== 'undefined' ? window.location.href : '');
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Red Helix Research" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Mobile & Additional SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Red Helix Research" />
      <meta name="rating" content="safe for kids" />
      <link rel="alternate" hrefLang="en-us" href={url} />

      {/* Schema.org structured data */}
      {Array.isArray(schema) ? (
        schema.map((schemaItem, idx) => (
          <script key={idx} type="application/ld+json">
            {JSON.stringify(schemaItem)}
          </script>
        ))
      ) : schema ? (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ) : null}
    </Helmet>
  );
}