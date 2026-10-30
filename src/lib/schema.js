import { SITE, AUTHOR } from "../site.config.js";

const abs = (path) => new URL(path, SITE.url).href;

export const personRef = {
  "@type": "Person",
  "@id": `${SITE.url}/author/${AUTHOR.slug}/#person`,
  name: AUTHOR.name,
  url: `${SITE.url}/author/${AUTHOR.slug}/`,
  jobTitle: AUTHOR.role,
  image: `${SITE.url}${AUTHOR.photo}`,
  sameAs: [AUTHOR.linkedin, AUTHOR.github].filter(Boolean),
};

export const orgRef = {
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: {
    "@type": "ImageObject",
    url: `${SITE.url}/logo-512.png`,
    width: 512,
    height: 512,
  },
};

/** crumbs: [{ name, path }], the last one being the current page. */
export function breadcrumbSchema(crumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

export function articleSchema({ title, description, path, published, updated, image }) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    image: image ? [abs(image)] : [`${SITE.url}/og.png`],
    mainEntityOfPage: abs(path),
    datePublished: published.toISOString().slice(0, 10),
    dateModified: (updated ?? published).toISOString().slice(0, 10),
    author: personRef,
    publisher: orgRef,
    inLanguage: SITE.language,
  };
}

export function calculatorSchema({ name, description, path, updated }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: abs(path),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (runs in the browser)",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: personRef,
    publisher: orgRef,
    dateModified: updated,
  };
}

export function faqSchema(items) {
  if (!items || items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
