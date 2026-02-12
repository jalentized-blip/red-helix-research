// Comprehensive Schema.org Markup Helpers for Gold-Standard SEO
// All schemas follow Google's structured data guidelines

const SITE_URL = 'https://redhelixresearch.com';
const SITE_NAME = 'Red Helix Research';
const LOGO_URL = 'https://i.ibb.co/M5CYvjkG/websitelogo.png';
const CONTACT_EMAIL = 'jake@redhelixresearch.com';

// Organization Schema - core business identity
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: LOGO_URL,
    width: 512,
    height: 512
  },
  image: LOGO_URL,
  description: 'USA-based supplier of premium research-grade peptides with HPLC-verified purity and third-party Certificates of Analysis.',
  email: CONTACT_EMAIL,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English'],
      url: `${SITE_URL}/Contact`,
      email: CONTACT_EMAIL
    }
  ],
  sameAs: [
    'https://discord.gg/zdn52v73',
    'https://t.me/Redhelixresearch',
    'https://www.tiktok.com/@redhelixresearch'
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US'
  },
  foundingDate: '2024',
  knowsAbout: [
    'Research Peptides',
    'BPC-157',
    'TB-500',
    'Semaglutide',
    'Tirzepatide',
    'Certificate of Analysis',
    'HPLC Verification',
    'Peptide Research'
  ]
});

// WebSite Schema with SearchAction for sitelinks search box
export const generateWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/Products?search={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  },
  inLanguage: 'en-US'
});

// WebPage Schema - for individual pages
export const generateWebPageSchema = (page) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}${page.path}#webpage`,
  url: `${SITE_URL}${page.path}`,
  name: page.title,
  description: page.description,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en-US',
  dateModified: page.dateModified || new Date().toISOString().split('T')[0]
});

// Product Schema with AggregateOffer for price ranges
export const generateProductSchema = (product) => {
  if (!product) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Research-grade ${product.name} peptide — HPLC verified, lab-tested with third-party COA`,
    image: product.image_url,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME
    },
    manufacturer: {
      '@type': 'Organization',
      name: SITE_NAME
    },
    category: product.category,
    sku: product.sku || product.id,
    mpn: product.id,
    offers: {
      '@type': 'AggregateOffer',
      url: `${SITE_URL}/Products?product=${encodeURIComponent(product.name)}`,
      priceCurrency: 'USD',
      lowPrice: product.price_from?.toString(),
      highPrice: (product.specifications?.length > 0
        ? Math.max(...product.specifications.map(s => s.price || 0))
        : product.price_from)?.toString(),
      offerCount: product.specifications?.length || 1,
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@id': `${SITE_URL}/#organization` },
      offers: product.specifications?.map(spec => ({
        '@type': 'Offer',
        name: spec.name,
        price: spec.price?.toString(),
        priceCurrency: 'USD',
        availability: spec.in_stock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${SITE_URL}/Products?product=${encodeURIComponent(product.name)}`,
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        itemCondition: 'https://schema.org/NewCondition'
      })) || [{
        '@type': 'Offer',
        price: product.price_from?.toString(),
        priceCurrency: 'USD',
        availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${SITE_URL}/Products?product=${encodeURIComponent(product.name)}`,
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        itemCondition: 'https://schema.org/NewCondition'
      }]
    }
  };

  if (product.reviews?.length > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1),
      reviewCount: product.reviews.length,
      bestRating: '5',
      worstRating: '1'
    };
    schema.review = product.reviews.slice(0, 5).map(review => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.author || 'Verified Researcher' },
      datePublished: review.date,
      reviewRating: { '@type': 'Rating', ratingValue: review.rating.toString(), bestRating: '5' },
      reviewBody: review.comment
    }));
  }

  return schema;
};

// ItemList Schema for product catalog pages
export const generateItemListSchema = (products, listName = 'Research Peptides Catalog') => {
  if (!products?.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.name,
      url: `${SITE_URL}/Products?product=${encodeURIComponent(product.name)}`
    }))
  };
};

// CollectionPage Schema for product listing pages
export const generateCollectionPageSchema = (title, description, path) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: title,
  description: description,
  url: `${SITE_URL}${path}`,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: {
    '@type': 'Thing',
    name: 'Research Peptides'
  },
  inLanguage: 'en-US'
});

// FAQ Schema
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

// BreadcrumbList Schema
export const generateBreadcrumbSchema = (items) => {
  if (!items?.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
    }))
  };
};

// HowTo Schema for guides
export const generateHowToSchema = (title, description, steps, totalTime) => {
  if (!steps?.length) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: (index + 1).toString(),
      name: step.title,
      text: step.description,
      ...(step.image ? { image: step.image } : {})
    }))
  };

  if (totalTime) {
    schema.totalTime = totalTime;
  }

  return schema;
};

// Article Schema for blog/guide content
export const generateArticleSchema = (article) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.excerpt,
  image: article.image || LOGO_URL,
  datePublished: article.date,
  dateModified: article.updated || article.date,
  author: {
    '@type': 'Organization',
    name: article.author || SITE_NAME,
    url: SITE_URL
  },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL
    }
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': article.url || SITE_URL
  },
  inLanguage: 'en-US'
});

// Course Schema for Peptide Academy
export const generateCourseSchema = (course) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: course.title,
  description: course.description,
  provider: {
    '@type': 'Organization',
    name: SITE_NAME,
    sameAs: SITE_URL
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'online',
    courseWorkload: 'Self-paced'
  },
  isAccessibleForFree: true,
  inLanguage: 'en-US'
});

// MedicalWebPage Schema for research compliance
export const generateMedicalWebPageSchema = (page) => ({
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: page.title,
  description: page.description,
  url: page.url || SITE_URL,
  audience: {
    '@type': 'MedicalAudience',
    audienceType: 'Researchers, Laboratory Professionals, Scientists'
  },
  specialty: {
    '@type': 'MedicalSpecialty',
    name: 'Biochemistry'
  },
  lastReviewed: new Date().toISOString().split('T')[0],
  inLanguage: 'en-US'
});

// Store/LocalBusiness Schema
export const generateLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Store',
  '@id': `${SITE_URL}/#store`,
  name: SITE_NAME,
  image: LOGO_URL,
  description: 'USA-based supplier of lab-tested research peptides with third-party verified certificates of analysis.',
  url: SITE_URL,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: CONTACT_EMAIL,
    availableLanguage: 'English'
  },
  sameAs: [
    'https://discord.gg/zdn52v73',
    'https://t.me/Redhelixresearch',
    'https://www.tiktok.com/@redhelixresearch'
  ],
  priceRange: '$$',
  paymentAccepted: ['ACH Bank Transfer', 'Cryptocurrency'],
  currenciesAccepted: 'USD',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '17:00'
  }
});

// AboutPage Schema
export const generateAboutPageSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: `About ${SITE_NAME}`,
  description: `Learn about ${SITE_NAME}'s commitment to transparency, quality, and affordable research peptides with verified COAs.`,
  url: `${SITE_URL}/About`,
  mainEntity: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en-US'
});

// ContactPage Schema
export const generateContactPageSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: `Contact ${SITE_NAME}`,
  description: `Get in touch with ${SITE_NAME} for research peptide inquiries, support, and wholesale orders.`,
  url: `${SITE_URL}/Contact`,
  mainEntity: {
    '@type': 'Organization',
    name: SITE_NAME,
    email: CONTACT_EMAIL,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: 'English'
    }
  }
});

// SiteNavigationElement Schema for improved crawling
export const generateSiteNavigationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SiteNavigationElement',
  name: 'Main Navigation',
  hasPart: [
    { '@type': 'WebPage', name: 'Home', url: SITE_URL },
    { '@type': 'WebPage', name: 'Products', url: `${SITE_URL}/Products` },
    { '@type': 'WebPage', name: 'About', url: `${SITE_URL}/About` },
    { '@type': 'WebPage', name: 'Contact', url: `${SITE_URL}/Contact` },
    { '@type': 'WebPage', name: 'Peptide Calculator', url: `${SITE_URL}/PeptideCalculator` },
    { '@type': 'WebPage', name: 'Research & Education', url: `${SITE_URL}/LearnMore` },
    { '@type': 'WebPage', name: 'COA Reports', url: `${SITE_URL}/COAReports` },
    { '@type': 'WebPage', name: 'FAQ', url: `${SITE_URL}/ExpandedFAQ` }
  ]
});

export default {
  generateProductSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateBreadcrumbSchema,
  generateArticleSchema,
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateWebPageSchema,
  generateCourseSchema,
  generateMedicalWebPageSchema,
  generateItemListSchema,
  generateCollectionPageSchema,
  generateAboutPageSchema,
  generateContactPageSchema,
  generateSiteNavigationSchema
};
