import React from 'react';
import { Helmet } from 'react-helmet';

export default function SEO({ 
  title = 'Red Helix Research - Gray Market Research Peptides | Verified Lab-Tested Supplier',
  description = 'Trusted gray market peptide supplier with transparent COA verification. Alternative research peptide source for weight loss, recovery, cognitive enhancement. Underground peptide vendor with third-party lab testing for BPC-157, TB-500, semaglutide, tirzepatide.',
  keywords = 'gray market peptides, research peptides, peptide supplier, peptide vendor, underground peptides, research chemical supplier, alternative peptide source, lab tested peptides, peptide marketplace, BPC-157, TB-500, semaglutide, tirzepatide, peptide COA, verified peptides, research grade peptides, peptide community, peptide research chemicals',
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

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Red Helix Research" />

      {/* Schema.org structured data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}