// Advanced Schema Markup Helpers for SEO

// NEW: Organization Schema
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Red Helix Research",
    "url": "https://redhelixresearch.com",
    "logo": "https://i.ibb.co/M5CYvjkG/websitelogo.png",
    "description": "Premium research-grade peptides supplier with lab-tested products and Certificate of Analysis verification.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": "English",
      "url": "https://redhelixresearch.com/Contact"
    },
    "sameAs": [
      "https://discord.gg/s78Jeajp",
      "https://t.me/+UYRVjzIFDy9iYzc9",
      "https://www.tiktok.com/@redhelixresearch"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    }
  };
};

// NEW: WebSite Schema
export const generateWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Red Helix Research",
    "url": "https://redhelixresearch.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://redhelixresearch.com/Products?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
};

// NEW: Course Schema for Peptide Academy
export const generateCourseSchema = (course) => {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "Red Helix Research",
      "sameAs": "https://redhelixresearch.com"
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "courseWorkload": "Self-paced"
    }
  };
};

export const generateProductSchema = (product) => {
  if (!product) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Research-grade ${product.name} peptide, lab-tested and verified`,
    image: product.image_url,
    offers: {
      '@type': 'AggregateOffer',
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceCurrency: 'USD',
      lowPrice: product.price_from?.toString(),
      highPrice: (product.specifications?.length > 0 ? Math.max(...product.specifications.map(s => s.price || 0)) : product.price_from)?.toString(),
      offerCount: product.specifications?.length || 1,
      offers: product.specifications?.map(spec => ({
        '@type': 'Offer',
        name: spec.name,
        price: spec.price?.toString(),
        priceCurrency: 'USD',
        availability: spec.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `https://redhelixresearch.com/products/${product.id}`
      })) || [{
        '@type': 'Offer',
        price: product.price_from?.toString(),
        priceCurrency: 'USD',
        availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `https://redhelixresearch.com/products/${product.id}`
      }]
    },
    aggregateRating: product.reviews?.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1),
      reviewCount: product.reviews.length,
      bestRating: '5',
      worstRating: '1'
    } : undefined,
    review: product.reviews?.map(review => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.author || 'Anonymous' },
      datePublished: review.date,
      reviewRating: { '@type': 'Rating', ratingValue: review.rating },
      reviewBody: review.comment
    }))
  };
};

export const generateFAQSchema = (faqs) => {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

export const generateHowToSchema = (title, steps) => {
  if (!steps || steps.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: (index + 1).toString(),
      name: step.title,
      text: step.description,
      image: step.image
    }))
  };
};

export const generateBreadcrumbSchema = (items) => {
  if (!items || items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: (index + 1).toString(),
      name: item.name,
      item: `https://redhelixresearch.com${item.url}`
    }))
  };
};

// NEW: MedicalWebPage Schema for Research Compliance
// Used by major competitors like Bachem to denote scientific nature of content
export const generateMedicalWebPageSchema = (page) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: page.title,
    description: page.description,
    audience: {
      '@type': 'Audience',
      audienceType: 'Researchers, Laboratory Professionals'
    },
    specialty: {
      '@type': 'MedicalSpecialty',
      name: 'Biochemistry'
    },
    lastReviewed: new Date().toISOString().split('T')[0]
  };
};

export const generateArticleSchema = (article) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image || 'https://redhelixresearch.com/og-image.png',
    datePublished: article.date,
    dateModified: article.updated || article.date,
    author: {
      '@type': 'Organization',
      name: article.author || 'Red Helix Research',
      url: 'https://redhelixresearch.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Red Helix Research',
      logo: {
        '@type': 'ImageObject',
        url: 'https://i.ibb.co/M5CYvjkG/websitelogo.png'
      }
    },
    mainEntity: {
      '@type': 'Article',
      name: article.title
    }
  };
};

export const generateLocalBusinessSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Red Helix Research',
    image: 'https://i.ibb.co/M5CYvjkG/websitelogo.png',
    description: 'USA-based supplier of lab-tested research peptides with third-party verified certificates of analysis.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
      addressRegion: 'USA'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'jake@redhelixresearch.com'
    },
    sameAs: [
      'https://discord.gg/zdn52v73',
      'https://t.me/Redhelixresearch',
      'https://www.tiktok.com/@redhelixresearch'
    ]
  };
};

export default {
  generateProductSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateBreadcrumbSchema,
  generateArticleSchema,
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateCourseSchema,
  generateMedicalWebPageSchema
};