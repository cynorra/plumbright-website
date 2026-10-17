// One place for everything that names the site. Change the brand or domain
// here and every page, meta tag and schema block follows.

export const SITE = {
  name: "Material Guides",
  domain: "materialguides.com",
  url: "https://materialguides.com",
  tagline: "Material calculators and planning guides for home projects",
  description:
    "Free calculators and technical guides for concrete, tile, flooring, drywall, decks, roofing and other home projects, with the formulas, assumptions and worked examples behind every number.",
  language: "en-US",
  locale: "en_US",
  foundingYear: 2026,

  // Editorial & contact email
  email: "hello@materialguides.com",

  // Optional. A form backend URL (Formspree, Basin, Cloudflare Worker...).
  // Leave empty and the contact page shows the email address only.
  contactFormEndpoint: "",

  // Google AdSense Publisher ID
  adsensePublisherId: "ca-pub-4674211063760769",

  // Search engine ownership verification (meta tag method). Paste only the
  // content="..." value each tool gives you. Bing can also import from Google
  // Search Console, in which case its tag is not needed.
  verification: {
    google: "",
    bing: "", // msvalidate.01
    yandex: "",
  },

  // IndexNow key (Bing, Yandex, Seznam, Naver and others). Served at
  // /indexnow-key.txt. Any 8–128 character hex string works; keep it stable.
  indexNowKey: "d28c5a05a99f5176adf74a2dd2414fd5",
};

export const AUTHOR = {
  name: "Eren Şimşir",
  slug: "eren-simsir",
  role: "Founder, Editor & Software Engineer",
  photo: "/images/eren-simsir.jpg",
  linkedin: "https://www.linkedin.com/in/ernsmsr/",
  github: "https://github.com/cynorra",
  shortBio:
    "Computer engineer (M.Sc. student at Kocaeli University, B.Sc. Düzce University) with a double major in industrial engineering. Dedicated to developing accurate, open-formula construction calculators and technical planning guides.",
};

export const NAV = [
  { href: "/guides/", label: "Guides & Articles" },
  { href: "/calculators/", label: "Calculators" },
  { href: "/about/", label: "About" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/contact/", label: "Contact" },
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
  { href: "/rss.xml", label: "RSS Feed" },
];
