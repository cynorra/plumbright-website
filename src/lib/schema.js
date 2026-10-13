import { SITE, AUTHOR } from "../site.config.js";

const abs = (path) => new URL(path, SITE.url).href;

export const personRef = { "@id": `${SITE.url}/author/${AUTHOR.slug}/#person` };
export const orgRef = { "@id": `${SITE.url}/#organization` };

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

export function articleSchema({ title, description, path, published, updated }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
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
