import React from 'react';
import { Helmet } from 'react-helmet';

const SITE_URL = 'https://redhelixresearch.com';
const SITE_NAME = 'Red Helix Research';
const DEFAULT_IMAGE = 'https://i.ibb.co/M5CYvjkG/websitelogo.png';

export default function SEO({
  title = 'Red Helix Research | Premium Research Peptides USA — Lab-Tested & COA Verified',
  description = 'Buy premium research-grade peptides from Red Helix Research. HPLC-verified BPC-157, TB-500, Semaglutide, Tirzepatide with third-party COA. USA-based supplier. For research use only.',
  keywords = 'research peptides USA, buy research peptides, peptide supplier USA, BPC-157, TB-500, semaglutide research, tirzepatide research, COA verified peptides, lab-tested peptides, high purity peptides, research grade peptides, peptide vendor, research chemicals',
  canonical,
  schema,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  article
}) {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : SITE_URL;
  const cleanCanonical = canonical || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : SITE_URL);

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={SITE_NAME} />

      {/* Canonical URL */}
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
      <meta property="og:description" content={description} />
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
      <meta name="twitter:description" content={description} />
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
