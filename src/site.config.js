// One place for everything that names the site. Change the brand or domain
// here and every page, meta tag and schema block follows.

export const SITE = {
  name: "Plumbright",
  domain: "plumbright.com",
  url: "https://plumbright.com",
  tagline: "Material calculators and planning guides for home projects",
  description:
    "Free calculators for concrete, tile, paint and other home projects, with the formulas, assumptions and worked examples behind every number.",
  language: "en-US",
  locale: "en_US",
  foundingYear: 2026,

  // TODO before launch: a real inbox on your own domain.
  email: "hello@plumbright.com",

  // Optional. A form backend URL (Formspree, Basin, Cloudflare Worker...).
  // Leave empty and the contact page shows the email address only.
  contactFormEndpoint: "",

  // Filled in after AdSense approval. Keep empty until then.
  adsensePublisherId: "",
};

export const AUTHOR = {
  name: "Eren Şimşir",
  slug: "eren-simsir",
  role: "Founder and editor",
  // TODO: put a real photo at public/images/eren-simsir.jpg (square, 400x400+).
  photo: "/images/eren-simsir.jpg",
  linkedin: "https://www.linkedin.com/in/ernsmsr",
  github: "https://github.com/cynorra",
  shortBio:
    "Computer engineer with a second major in industrial engineering. I build the calculators on this site and write the guides that explain the math behind them.",
};

export const NAV = [
  { href: "/concrete-calculator/", label: "Concrete" },
  { href: "/tile-calculator/", label: "Tile" },
  { href: "/paint-calculator/", label: "Paint" },
  { href: "/guides/", label: "Guides" },
  { href: "/about/", label: "About" },
];

export const FOOTER_LINKS = [
  { href: "/about/", label: "About" },
  { href: `/author/${AUTHOR.slug}/`, label: "Author" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/editorial-policy/", label: "Editorial policy" },
  { href: "/contact/", label: "Contact" },
  { href: "/privacy/", label: "Privacy policy" },
  { href: "/terms/", label: "Terms of use" },
  { href: "/disclaimer/", label: "Disclaimer" },
];
