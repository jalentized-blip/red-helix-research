/**
 * JSON-LD Schema generation utilities for SEO
 */

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
      "https://t.me/+UYRVjzIFDy9iYzc9"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    }
  };
};

export const generateProductSchema = (product) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image_url,
    "brand": {
      "@type": "Brand",
      "name": "Red Helix Research"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://redhelixresearch.com/Products?product=${encodeURIComponent(product.name)}`,
      "priceCurrency": "USD",
      "price": product.price_from.toString(),
      "availability": product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Red Helix Research"
      }
    },
    "category": product.category,
    "isForResearchOnly": true,
    "potentialAction": {
      "@type": "TradeAction",
      "target": {
        "@type": "EntryPoint",
        "url": "https://redhelixresearch.com/Products"
      }
    }
  };
};

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

export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.url
    }))
  };
};

export const generateFAQSchema = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};