import React from 'react';
import { Helmet } from 'react-helmet';

const SITE_URL = 'https://redhelixresearch.com';
const SITE_NAME = 'Red Helix Research';
const DEFAULT_IMAGE = 'https://i.ibb.co/M5CYvjkG/websitelogo.png';

export default function SEO({
  title = 'Research Peptides for Weight Loss, Biohacking & Athletic Performance | Red Helix Research',
  description = 'USA-based supplier of research peptides for weight loss, biohacking & athletic performance. Semaglutide, Tirzepatide, BPC-157, TB-500, CJC-1295 — HPLC-verified, COA certified. For research use only.',
  keywords = 'research peptides weight loss, biohacking peptides, peptides for athletic performance, health optimization peptides, GLP-1 research peptide, semaglutide research, tirzepatide research, BPC-157 recovery, TB-500 performance, CJC-1295 ipamorelin research, longevity peptides, anti-aging research peptides, buy research peptides USA, COA verified peptides, HPLC tested peptides, affordable research peptides, peptide supplier USA, research chemicals, fat loss peptide research, muscle recovery research peptide',
  canonical,
  schema,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  article
}) {
  // Build clean canonical URL — strip query params and hash for consistent canonical
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const cleanCanonical = canonical || `${SITE_URL}${pathname === '/' || pathname === '/Home' ? '/' : pathname}`;

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  // Truncate description for SEO (max ~160 chars recommended)
  const trimmedDescription = description.length > 160
    ? description.substring(0, 157) + '...'
    : description;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={trimmedDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={SITE_NAME} />

      {/* Canonical URL — critical for SPA deduplication */}
      <link rel="canonical" href={cleanCanonical} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />}
      {!noindex && <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />}
      {!noindex && <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={cleanCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={trimmedDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={cleanCanonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={trimmedDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Article-specific tags */}
      {article && <meta property="article:published_time" content={article.publishedTime} />}
      {article && article.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
      {article && article.section && <meta property="article:section" content={article.section} />}
      {article && article.tags && article.tags.map((tag, i) => (
        <meta key={i} property="article:tag" content={tag} />
      ))}

      {/* Mobile & Additional SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#8B2635" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="3 days" />
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      <link rel="alternate" hrefLang="en-us" href={cleanCanonical} />

      {/* Schema.org structured data */}
      {Array.isArray(schema) ? (
        schema.filter(Boolean).map((schemaItem, idx) => (
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