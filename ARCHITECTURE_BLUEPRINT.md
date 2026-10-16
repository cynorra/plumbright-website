# Blueprint: Headless Static Content Engine (AdSense & SEO Optimized)

Bu belge; sıfır sunucu maliyetiyle çalışan, tamamen otonom yayın akışına sahip, Google AdSense onayını garantiye alan ve yapay zeka arama motorlarına (AEO/GEO) tam uyumlu niş web sitelerini hızla çoğaltmak (scale etmek) için standart mimari şablondur.

---

## 1. Mimari Genel Bakış

```
[Yerel Geliştirici / AI] 
       │ (Markdown + Ön Hazırlık)
       ▼
 [Supabase (PostgreSQL)] ────► RLS ile Zaman Kilitli (Schedule) Makaleler
       │
       ▼ (13:05 UTC Cron veya Git Push)
 [GitHub Actions] ────────────► Astro SSG Derlemesi (API ile Veri Çekimi + Testler)
       │
       ▼ (Otomatik Deploy)
 [Cloudflare Pages] ──────────► Sıfır Maliyetli, Global CDN / Edge Hosting
```

* **Frontend:** Astro (SSG - Static Site Generation) + TailwindCSS
* **Backend / Veritabanı:** Supabase (PostgreSQL + PostgREST + RLS)
* **CI/CD & Otomasyon:** GitHub Actions (Zamanlanmış cron tetikleyici)
* **Hosting:** Cloudflare Pages (Direct Upload / Wrangler)

---

## 2. Global Sabitler (Tüm Sitelerde Ortak Olan Bilgiler)

Tüm niş sitelerinizde tek merkezden aynı hesapları ve kimliği kullanabilmeniz için sabit bilgiler:

### A. Reklam & Cloudflare & IndexNow Hesap Bilgileri
* **Google AdSense Yayıncı Kimliği (Publisher ID):** `pub-4674211063760769`
* **Google AdSense Müşteri Kimliği:** `9067139789`
* **Cloudflare Account ID:** `500e418c58f83d22b8573faa44d2e71d`
* **IndexNow API Global Anahtarı:** `d28c5a05a99f5176adf74a2dd2414fd5`
* **IndexNow API Endpoint:** `https://api.indexnow.org/indexnow` *(Tüm sitelerde aynı anahtar kullanılabilir)*

### B. Ortak Yazar & E-E-A-T Profili (Tüm Siteler İçin Standart)
AdSense onayını hızlandıran gerçek mühendislik kimliği tüm sitelerde aynı kalacaktır:
* **İsim:** `Eren Şimşir`
* **Slug:** `eren-simsir`
* **Unvan:** `Founder, Editor & Software Engineer`
* **Görsel Yolu:** `public/images/eren-simsir.jpg` (Vesikalık portre)
* **LinkedIn:** `https://www.linkedin.com/in/ernsmsr/`
* **GitHub:** `https://github.com/cynorra`
* **Akademik Arka Plan:** Kocaeli Üniversitesi Bilgisayar Mühendisliği Yüksek Lisans (M.Sc. ongoing), Düzce Üniversitesi Bilgisayar Mühendisliği Lisans (B.Sc. 2025), Endüstri Mühendisliği Çift Anadal.
* **Kısa Biyografi (Short Bio):**
  > *"Computer engineer (M.Sc. student at Kocaeli University, B.Sc. Düzce University) with a double major in industrial engineering. Dedicated to developing accurate, open-formula calculations and technical planning guides."*

---

## 3. AdSense & SEO/AEO Onay Kuralları (Scale Ederken Değişmez İlkeler)

Yeni bir niş site açarken şu formülden asla sapılmamalıdır:

1. **Editoryal Öncelikli Ana Sayfa:** Sitenin ana sayfası sadece hesap makinesi/araç kutusu olmamalıdır. En üstte teknik rehberler ve makaleler (Hero + Featured Articles), hemen altında bu makalelerdeki formülleri çalıştıran yardımcı interaktif araçlar (Calculators) yer almalıdır.
2. **E-E-A-T (Deneyim, Uzmanlık, Otorite, Güvenilirlik):**
   * Yazar sayfası (`/author/[slug]/`) yukarıdaki akademik/mühendislik biyografisi ve vesikalık fotoğrafla sunulmalıdır.
   * `About`, `Methodology`, `Editorial Policy`, `Privacy Policy`, `Terms of Use`, `Disclaimer`, `Contact` sayfaları eksiksiz olmalıdır.
3. **FAQPage Schema (Zengin Sonuçlar):** Her hesaplama/rehber sayfasının altındaki Sıkça Sorulan Sorular bölümü derleme anında JSON-LD `FAQPage` şemasına dönüştürülmelidir.
4. **LLMs.txt (AEO & GEO):** Yapay zeka arama motorları için kök dizinde `/llms.txt` özeti bulunmalıdır.
5. **Yayın Zamanlama:** Tüm içerikler ilk gün basılmamalıdır. 4-5 makale ilk gün yayında olmalı, kalanlar gün aşırı veya her gün 1 adet olacak şekilde Supabase'e takvimlenmelidir.

---

## 3. Supabase Kurulumu (Tek SQL Şeması)

Her yeni sitede Supabase SQL Editor'e yapıştırılacak tek ve eksiksiz SQL şeması:

```sql
-- 1. Articles Tablosu
create table if not exists public.articles (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  title              text not null check (char_length(title) between 10 and 100),
  description        text not null check (char_length(description) between 70 and 180),
  body_md            text not null check (char_length(body_md) >= 300),
  tool               text not null, -- Nişe göre kategori/araç anahtarı (örn: concrete, tile, loan, bmi)
  status             text not null default 'draft' check (status in ('draft', 'published')),
  published_at       timestamptz,
  content_updated_at timestamptz,
  author_slug        text not null default 'eren-simsir',
  created_at         timestamptz not null default now(),
  modified_at        timestamptz not null default now(),
  constraint published_needs_date check (status = 'draft' or published_at is not null)
);

create index if not exists articles_live_idx on public.articles (status, published_at desc);

-- 2. Otomatik Güncelleme Tetikleyicisi
create or replace function public.articles_touch()
returns trigger language plpgsql as $$
begin
  new.modified_at := now();
  if tg_op = 'UPDATE'
     and old.status = 'published'
     and old.published_at is not null
     and old.published_at <= now()
     and (new.title is distinct from old.title
          or new.description is distinct from old.description
          or new.body_md is distinct from old.body_md
          or new.tool is distinct from old.tool) then
    new.content_updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch before insert or update on public.articles
for each row execute function public.articles_touch();

-- 3. Row Level Security (RLS) - Sadece tarihi geçmiş makaleler okunabilir
alter table public.articles enable row level security;

drop policy if exists "Public can read live articles" on public.articles;
create policy "Public can read live articles" on public.articles
for select to anon, authenticated using (status = 'published' and published_at <= now());

revoke all on public.articles from anon, authenticated;
grant select on public.articles to anon, authenticated;
```

---

## 4. Frontend Çekirdek Dosyaları

### A. Tek Merkezli Yapılandırma (`src/site.config.js`)
Yeni site açarken sadece bu dosya güncellenir:
```javascript
export const SITE = {
  name: "SiteAdi",
  domain: "siteadi.com",
  url: "https://siteadi.com",
  tagline: "Niş sloganı",
  description: "Meta açıklaması...",
  language: "en-US",
  locale: "en_US",
  foundingYear: 2026,
  email: "hello@siteadi.com",
  contactFormEndpoint: "",
  adsensePublisherId: "", // Onay öncesi boş, onay sonrası pub-xxx
  verification: { google: "", bing: "", yandex: "" },
  indexNowKey: "stabil-hex-anahtari",
};

export const AUTHOR = {
  name: "Eren Şimşir",
  slug: "eren-simsir",
  role: "Founder, Editor & Software Engineer",
  photo: "/images/eren-simsir.jpg",
  linkedin: "https://www.linkedin.com/in/ernsmsr/",
  github: "https://github.com/cynorra",
  shortBio: "Computer engineer (M.Sc. student at Kocaeli University, B.Sc. Düzce University) with a double major in industrial engineering...",
};

export const NAV = [
  { href: "/guides/", label: "Guides & Articles" },
  { href: "/calculators/", label: "Calculators" },
  { href: "/about/", label: "About" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/contact/", label: "Contact" },
];
```

### B. Otomatik İçerik Yükleyici (`src/lib/articles-source.js`)
Build anında Supabase'den veri çeker, yoksa yerel Markdown'a fallback yapar:
```javascript
import { loadEnv } from "vite";
import { readdirSync, readFileSync } from "node:fs";
import { guideRow } from "./frontmatter.js";

const env = { ...loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), ""), ...process.env };
export const SUPABASE_URL = env.SUPABASE_URL?.replace(/\/$/, "") ?? "";
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY ?? "";
export const useSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const COLUMNS = "slug,title,description,body_md,tool,published_at,content_updated_at,author_slug";

export async function fetchLiveArticles() {
  const now = new Date().toISOString();
  const url = `${SUPABASE_URL}/rest/v1/articles?select=${COLUMNS}&status=eq.published&published_at=lte.${encodeURIComponent(now)}&order=published_at.desc`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.statusText}`);
  return res.json();
}

export const day = (iso) => (iso ? iso.slice(0, 10) : undefined);
export function updatedDay(row) {
  const pub = day(row.published_at);
  const upd = day(row.content_updated_at);
  return upd && upd > pub ? upd : undefined;
}

export function localRows() {
  const dir = new URL("../content/guides/", import.meta.url);
  return readdirSync(dir).filter(f => f.endsWith(".md")).map(f => guideRow(f, readFileSync(new URL(f, dir), "utf8")));
}

export function localLiveArticles(now = new Date()) {
  return localRows().filter(r => r.status === "published" && new Date(r.published_at) <= now).sort((a,b) => b.published_at.localeCompare(a.published_at));
}

export async function liveArticles() {
  return useSupabase ? fetchLiveArticles() : localLiveArticles();
}
```

### C. Kapsamlı JSON-LD Şemaları (`src/lib/schema.js`) - E-E-A-T & AEO/GEO Omurgası
Arama motorları ve LLM'ler (ChatGPT, Perplexity) için tam semantik bağlantı kurar:
```javascript
import { SITE, AUTHOR } from "../site.config.js";

const abs = (path) => new URL(path, SITE.url).href;

export const personRef = { "@id": `${SITE.url}/author/${AUTHOR.slug}/#person` };
export const orgRef = { "@id": `${SITE.url}/#organization` };

// 1. Ekmek Kırıntısı (Breadcrumb)
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

// 2. Teknik Makale Şeması (Google News & AI Citation için)
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

// 3. Hesap Makinesi / Web Aracı Şeması
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

// 4. Otomatik FAQ Şeması (Zengin Snippet & Sesli/AI Yanıtlar)
export function faqSchema(items) {
  if (!items || items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
```

### D. Global Head & AdSense Entegrasyonu (`src/layouts/Base.astro`)
Tüm sayfalarda meta etiketleri, Organization/WebSite şemalarını ve AdSense scriptini otomatik yöneten standart head mimarisi:
```astro
---
import { SITE, AUTHOR } from "../site.config.js";

const { title, description, schema = [], noindex = false, ogType = "website", ogImage = "/og.png", published, updated } = Astro.props;
const canonical = new URL(Astro.url.pathname, SITE.url).href;
const ogImageUrl = new URL(ogImage, SITE.url).href;

// Site Genel Şemaları (Graph ID ile birbirine bağlı)
const siteSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: { "@type": "ImageObject", url: `${SITE.url}/logo-512.png`, width: 512, height: 512 },
    email: SITE.email,
    founder: { "@id": `${SITE.url}/author/${AUTHOR.slug}/#person` },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: SITE.language,
    publisher: { "@id": `${SITE.url}/#organization` },
  },
];
const allSchema = [...siteSchema, ...schema];
---
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} | {SITE.name}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta name="robots" content={noindex ? "noindex, follow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
    
    <!-- AI & AEO Keşif Bağlantısı -->
    <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-friendly site summary" />
    <meta name="author" content={AUTHOR.name} />

    <!-- OpenGraph & Twitter Cards -->
    <meta property="og:site_name" content={SITE.name} />
    <meta property="og:type" content={ogType} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImageUrl} />
    {published && <meta property="article:published_time" content={published.toISOString()} />}
    {(updated || published) && <meta property="article:modified_time" content={(updated ?? published).toISOString()} />}
    <meta name="twitter:card" content="summary_large_image" />

    <!-- Tüm JSON-LD Şemalarının Enjeksiyonu -->
    {allSchema.map((s) => <script type="application/ld+json" set:html={JSON.stringify(s)} />)}

    <!-- Google AdSense (site.config.js içinde Publisher ID doluysa otomatik yüklenir) -->
    {SITE.adsensePublisherId && (
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsensePublisherId}`}
        crossorigin="anonymous"
      ></script>
    )}
  </head>
  <body>
    <slot />
  </body>
</html>
```

### E. Arama Motorları & AI Bot Uç Noktaları (`robots.txt.ts` & `llms.txt.ts`)

Botların siteyi JavaScript çalıştırmadan, sıfır gecikmeyle ve hatasız okuması için gerekli dinamik uç noktalar:

#### 1. Tam İzinli ve Ayrıştırılmış `robots.txt` (`src/pages/robots.txt.ts`)
```typescript
import type { APIRoute } from "astro";
import { SITE } from "../site.config.js";

const BOTS = [
  // Arama Motorları
  "Googlebot", "Googlebot-Image", "Bingbot", "Applebot", "DuckDuckBot", "YandexBot", "Baiduspider",
  // AdSense Taraması (AdSense onayı için hayati)
  "Mediapartners-Google", "AdsBot-Google",
  // Yapay Zeka Arama ve Yanıt Motorları (AEO / GEO)
  "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User",
  // Yapay Zeka Eğitim Botları
  "GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "meta-externalagent"
];

export const GET: APIRoute = () => {
  const groups = BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n");
  const body = `# ${SITE.name}: open to all search engines and AI crawlers.\n\nUser-agent: *\nAllow: /\n\n${groups}\n\nSitemap: ${SITE.url}/sitemap-index.xml\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
```

#### 2. AI Özet ve Çıplak Bilgi Uç Noktası (`src/pages/llms.txt.ts`)
LLM'lerin (ChatGPT, Perplexity vb.) sitenizi tek bir istekte hatasız hafızasına alabilmesi için standart özet:
```typescript
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE, AUTHOR } from "../site.config.js";
import { TOOLS } from "../lib/tools.js";

export const GET: APIRoute = async () => {
  const u = (p: string) => new URL(p, SITE.url).href;
  const guides = (await getCollection("guides", (g) => !g.data.draft)).sort((a, b) => a.data.title.localeCompare(b.data.title));

  const body = `# ${SITE.name}\n\n> ${SITE.description} Written by ${AUTHOR.name}.\n\n## Calculators\n\n${TOOLS.map((t) => `- [${t.name}](${u(t.href)}): ${t.blurb}`).join("\n")}\n\n## Guides\n\n${guides.map((g) => `- [${g.data.title}](${u(`/guides/${g.id}/`)}): ${g.data.description}`).join("\n")}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
```

#### 3. Bing Sahiplik Doğrulama Dosyası (`src/pages/indexnow-key.txt.ts`)
```typescript
import type { APIRoute } from "astro";
import { SITE } from "../site.config.js";

export const GET: APIRoute = () =>
  new Response(SITE.indexNowKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
```


---

## 5. Makaleleri Supabase'e Otomatik Basma Betiği (`scripts/push-guides.mjs`)

Yerel `src/content/guides/` klasöründeki Markdown dosyalarını tek tıkla Supabase'e yükler:

```javascript
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { guideRow } from "../src/lib/frontmatter.js";

const parseDotEnv = () => {
  const env = { ...process.env };
  if (existsSync(".env")) {
    for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq > 0) env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
  return env;
};

const env = parseDotEnv();
const URL_ = env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");

if (!dry && (!URL_ || !KEY)) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const dir = new URL("../src/content/guides/", import.meta.url);
const files = readdirSync(dir).filter(f => f.endsWith(".md"));
const rows = files.map(file => {
  const { content_updated_at, author_slug, ...row } = guideRow(file, readFileSync(new URL(file, dir), "utf8"));
  return row;
});

if (dry) {
  rows.forEach(r => console.log(r.slug, r.published_at));
  process.exit(0);
}

const res = await fetch(`${URL_}/rest/v1/articles?on_conflict=slug`, {
  method: "POST",
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
  body: JSON.stringify(rows),
});

if (!res.ok) console.error("Error:", await res.text());
else console.log(`Successfully pushed ${rows.length} articles.`);
```

### B. Kırık Link ve Zamanlama Kontrol Betiği (`scripts/check-links.mjs`)
Build sonrası hiçbir kırık linkin ve henüz yayınlanmamış makalelere verilen linklerin canlıya çıkmamasını garantiler:

```javascript
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { localRows } from "../src/lib/articles-source.js";

const DIST = new URL("../dist/", import.meta.url).pathname;
const problems = [];

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
  });
}

if (existsSync(DIST)) {
  for (const file of walk(DIST)) {
    const html = readFileSync(file, "utf8");
    for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) {
      if (href.startsWith("//")) continue;
      const target = join(DIST, href);
      const ok = href.endsWith("/") ? existsSync(join(target, "index.html")) : existsSync(target);
      if (!ok) problems.push(`${file.replace(DIST, "/")} -> ${href}`);
    }
  }
}

const rows = localRows();
const date = Object.fromEntries(rows.map((r) => [r.slug, r.published_at]));
for (const r of rows) {
  for (const m of r.body_md.matchAll(/\]\(\/guides\/([^/)]+)\/?\)|href="\/guides\/([^/"]+)/g)) {
    const slug = m[1] ?? m[2];
    if (!(slug in date)) problems.push(`${r.slug}: links to missing guide ${slug}`);
    else if (r.published_at && date[slug] && date[slug] > r.published_at) {
      problems.push(`${r.slug} (${r.published_at.slice(0, 10)}) links to ${slug}, which publishes later (${date[slug].slice(0, 10)})`);
    }
  }
}

if (problems.length) {
  console.error(`${problems.length} link problem(s):\n` + [...new Set(problems)].join("\n"));
  process.exit(1);
}
console.log("Links OK");
```

### C. Makale Yayın Tarihlerini Yeniden Dağıtma (`scripts/reschedule.mjs`)
Makale yayın takvimini otomatik olarak günlere yayar (haftada 4, 5 veya 6 gün):

```javascript
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const start = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const dry = args.includes("--dry-run");
const perWeek = Number(args[args.indexOf("--per-week") + 1]) || 6;
if (!start) {
  console.error("Usage: node scripts/reschedule.mjs YYYY-MM-DD [--dry-run] [--per-week N]");
  process.exit(1);
}

const DAYS = { 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6] }[perWeek];
if (!DAYS) throw new Error("--per-week must be 3 to 7");

const dir = new URL("../src/content/guides/", import.meta.url);
const today = new Date().toISOString().slice(0, 10);
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const text = readFileSync(new URL(f, dir), "utf8");
    return { f, text, date: text.match(/^published:\s*(\S+)/m)?.[1] };
  })
  .filter((g) => g.date && g.date > today && !/^draft:\s*true/m.test(g.text))
  .sort((a, b) => a.date.localeCompare(b.date) || a.f.localeCompare(b.f));

let d = new Date(`${start}T12:00:00Z`);
const next = () => {
  while (!DAYS.includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() + 1);
  const out = d.toISOString().slice(0, 10);
  d.setUTCDate(d.getUTCDate() + 1);
  return out;
};
for (const g of files) {
  const nd = next();
  console.log(`${g.date} -> ${nd}  ${g.f}`);
  if (!dry) writeFileSync(new URL(g.f, dir), g.text.replace(/^published:\s*\S+/m, `published: ${nd}`));
}
```

### D. Arama Motorlarına Anında Bildirim (`scripts/indexnow.mjs`)
Bing, Yandex, Seznam gibi arama motorlarına yeni yayınlanan sayfaları anında indeksletir:

```javascript
import { readFileSync, readdirSync } from "node:fs";
import { SITE } from "../src/site.config.js";

const args = process.argv.slice(2);
const since = args.includes("--since") ? args[args.indexOf("--since") + 1] : null;
const dry = args.includes("--dry-run");

const dist = new URL("../dist/", import.meta.url);
const files = readdirSync(dist).filter((f) => /^sitemap-\d+\.xml$/.test(f));
if (!files.length) throw new Error("No sitemap in dist/. Run npm run build first.");

const urls = [];
for (const f of files) {
  const xml = readFileSync(new URL(f, dist), "utf8");
  for (const m of xml.matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)) {
    const [, loc, lastmod] = m;
    if (!since || (lastmod && lastmod.slice(0, 10) >= since)) urls.push(loc);
  }
}

if (!urls.length) process.exit(0);

const body = {
  host: new URL(SITE.url).host,
  key: SITE.indexNowKey,
  keyLocation: `${SITE.url}/indexnow-key.txt`,
  urlList: urls.slice(0, 10000),
};

if (dry) process.exit(0);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
console.log(`IndexNow responded ${res.status} ${res.statusText}`);
```

---

## 6. Otomatik Cron & Deploy (`.github/workflows/deploy.yml`)

Bilgisayar kapalıyken her gün tetiklenen CI/CD boru hattı:

```yaml
name: Build and deploy

on:
  push:
    branches: [main]
  schedule:
    - cron: "5 13 * * *" # Her gün TSİ 16:05'te otomatik yayın
  workflow_dispatch:

concurrency:
  group: deploy
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm test

      - name: Build site with Supabase articles
        run: npm run build
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Deploy to Cloudflare Pages
        run: npx wrangler@4.142.0 pages deploy dist --project-name "${{ vars.CLOUDFLARE_PAGES_PROJECT }}" --branch main
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

---

## 7. Kritik Detaylar (AdSense ads.txt & Anında Tetikleme Webhook)

### A. Otomatik `ads.txt` Dosyası
AdSense hesabında gelir kaybı ve uyarı yaşamamak için `public/ads.txt` dosyası mutlaka eklenmelidir:
```
google.com, pub-4674211063760769, DIRECT, f08c47fec0942fa0
```
*(Tüm siteler aynı AdSense yayıncı kimliğini kullandığı için bu satır her sitede sabittir).*

### B. Supabase Webhook ile Anında Deploy (Opsiyonel ama Önerilir)
Günlük TSİ 16:05 cron'unu beklemeden, veritabanına yeni bir makale basıldığı anda GitHub Actions'ı tetiklemek için Supabase SQL Editor'de çalıştırılacak tetikleyici:
```sql
-- 1. Database > Extensions: "pg_net" eklentisini açın
-- 2. GitHub Personal Access Token (repo dispatch izinli) oluşturun
create or replace function public.request_site_rebuild()
returns trigger language plpgsql security definer as $$
begin
  perform net.http_post(
    url := 'https://api.github.com/repos/KULLANICI_ADI/REPO_ADI/dispatches',
    body := jsonb_build_object('event_type', 'articles-changed'),
    headers := jsonb_build_object(
      'Authorization', 'Bearer GITHUB_PAT_TOKENINIZ',
      'Accept', 'application/vnd.github+json',
      'User-Agent', 'supabase-pg-net'
    )
  );
  return null;
end;
$$;

drop trigger if exists articles_request_rebuild on public.articles;
create trigger articles_request_rebuild
after insert or update on public.articles
for each statement execute function public.request_site_rebuild();
```

---

## 8. GitHub Secrets & Variables Tam Tablosu (Eksiksiz Çetele)

GitHub Repo > **Settings > Secrets and variables > Actions**:

| Tür | İsim | Değer / Açıklama |
| :--- | :--- | :--- |
| **Secret** | `SUPABASE_URL` | Supabase > Project Settings > API > Project URL |
| **Secret** | `SUPABASE_ANON_KEY` | Supabase > Project Settings > API > anon public key |
| **Secret** | `CLOUDFLARE_ACCOUNT_ID` | `500e418c58f83d22b8573faa44d2e71d` *(Tüm sitelerde aynı)* |
| **Secret** | `CLOUDFLARE_API_TOKEN` | Cloudflare > My Profile > API Tokens > Cloudflare Pages Token |
| **Variable** | `CLOUDFLARE_PAGES_PROJECT` | Cloudflare Pages'te oluşturduğunuz proje adı (örn: `plumbright`) |

---

## 9. Yeni Niş Site Ölçekleme Kontrol Listesi (5 Dakikada Yeni Site)

Yeni bir fikir/niş belirlediğinde izlenecek adımlar:

1. **Repo Kopyalama:** Bu repo şablon olarak kopyalanır (`template repo`).
2. **Yapılandırma:** `src/site.config.js` içinde `SITE.name`, `SITE.domain` ve araç tanımları güncellenir.
3. **Supabase Veritabanı Açma & SQL:**
   * Supabase'de yeni ücretsiz bir proje açılır (`app.supabase.com`).
   * Sol menüden **SQL Editor** açılır ve bu belgedeki **"Bölüm 3: Supabase Kurulumu"** başlığı altındaki birleştirilmiş SQL sorgusunun tamamı yapıştırılıp **"Run"** tuşuna basılır (Tablo, RLS ve güvenlik kuralları 3 saniyede kurulur).
   * **Project Settings > API** bölümünden `Project URL`, `anon public key` ve `service_role secret` kopyalanır.
4. **İçerik:** 30-40 adet Markdown rehber `src/content/guides/` içine atılır ve yerel `.env` dosyasına anahtarlar yazıldıktan sonra `node scripts/push-guides.mjs` ile Supabase'e basılır.
5. **Cloudflare Pages:**
   * Cloudflare Dashboard (`dash.cloudflare.com`) > **Workers & Pages** > **Create application** > **Pages** > **Direct Upload** seçilir.
   * Proje adı girilir (örn: `siteadi`) ve "Create project" denir.
6. **GitHub Secrets:**
   * Yukarıdaki **Bölüm 8 Tablosundaki** 4 Secret ve 1 Variable girilir.
7. **Bitti & Yayında:** GitHub Actions workflow'u tetiklenir veya bir commit atılır; site Cloudflare üzerinden canlıya çıkar. Google Search Console'a `https://siteadi.com/sitemap-index.xml` verilir, 2-3 hafta sonra AdSense başvurusu yapılır.

---

## 10. Alan Adı (Domain) Satın Alma, DNS & Cloudflare Custom Domain Kurulum Rehberi

Yeni bir domain alındığında (Hostinger, GoDaddy, Namecheap vb.) sıfır hata ve sıfır bekleme ile Cloudflare Worker/Pages'e bağlama prosedürü:

---

### A. Adım Adım Kusursuz Kurulum Sırası (Tam Sıralı Akış)

```
[1. Domain Satın Alındı] 
        │
        ▼
[2. Cloudflare'e Domain Ekle ("Free Plan")] ──► Cloudflare 2 adet NS adresi verir
        │
        ▼
[3. Hostinger/Registrar'a Git] ───────────────► "Özel Ad Sunucuları" seçip Cloudflare NS'lerini yapıştır
        │
        ▼
[4. Cloudflare DNS Temizliği (KRİTİK!)] ──────► DNS > Records sekmesindeki eski "A" ve "CNAME" park kayıtlarını SİL
        │
        ▼
[5. Overview Doğrulaması] ─────────────────────► "Check nameservers now" tıkla -> Yeşil tik ("Active") gör
        │
        ▼
[6. Worker / Pages Custom Domain Ekle] ───────► Settings > Domains & Routes > "+ Add" > "Custom Domain"
```

---

### B. Detaylı Ekran & Tıklama Rehberi

#### 1. Adım: Cloudflare'e Domaini Tanıtma
1. [dash.cloudflare.com](https://dash.cloudflare.com/) adresine girin.
2. Sağ üstteki mavi **"Add a site"** butonuna tıklayın.
3. Domain adını yazın (örn: `materialguides.com`) ve **Continue** deyin.
4. Plan seçim ekranında en alttaki **"Free" ($0)** seçeneğini işaretleyip onaylayın.
5. Cloudflare mevcut kayıtları tarayıp size 2 adet Nameserver verecektir:
   * Örnek: `benedict.ns.cloudflare.com` ve `jillian.ns.cloudflare.com`
   * Bu iki adresi kopyalayın.

#### 2. Adım: Domain Sağlayıcısında (Hostinger vb.) Nameserver Değiştirme
1. Domaini aldığınız panele gidin (Hostinger: **hPanel > Alan Adları > domaininiz**).
2. Sol menüden **DNS / Ad Sunucuları (Nameservers)** sekmesine tıklayın.
3. **"Ad sunucularını değiştir (Change Nameservers)"** butonuna basın.
4. **"Özel ad sunucuları (Use own nameservers)"** seçeneğini işaretleyin.
5. Oradaki varsayılan sunucuları (`apollo.dns-parking.com` vb.) silip Cloudflare'in verdiği 2 adresi yapıştırın ve **Kaydet** deyin.
   > **Önemli Not:** Hostinger'daki işiniz burada bitti! Hostinger DNS paneline bir daha dokunmayın.

#### 3. Adım: Cloudflare DNS'teki Eski Park Kayıtlarını Temizleme (Hata Önleme)
1. Cloudflare Dashboard'da sol menüden **DNS > Records** (Kayıtlar) bölümüne girin.
2. Tabloda registrar'dan otomatik kopyalanmış eski park kayıtlarını görün:
   * `domaininiz.com` -> **Type: A** (örn: `2.57.91.91`)
   * `www.domaininiz.com` -> **Type: CNAME**
3. Bu satırların sağındaki **Edit > Delete (Sil)** butonuna basarak **MUTLAKA SİLİN**.
   *(TXT formatındaki Google Search Console doğrulama kayıtlarını silmeyin, onlar kalabilir).*

#### 4. Adım: Nameserver Onayını Tetikleme
1. Sol menüden en üstteki **Overview** (Genel Bakış) sayfasına gelin.
2. Sağ tarafta veya ortada bulunan mavi **"Check nameservers now"** butonuna basın.
3. Sayfayı yenileyin (F5). Ekranda **"Your domain is now protected by Cloudflare"** yeşil tikini görün.

#### 5. Adım: Worker / Pages'e Custom Domain Bağlama (Doğru ve Resmi Yöntem)
1. Sol menüden **Compute (Workers & Pages)** > **Workers & Pages** bölümüne girin.
2. Deploy ettiğiniz projeye (örn: `plumbright-website`) tıklayın.
3. Üstteki sekmelerden **Settings** (Ayarlar) sekmesine geçin.
4. Sol menüden **Domains & Routes** (Alan Adları ve Rotalar) seçeneğine tıklayın.
5. Sağdaki mavi **"+ Add"** butonuna basıp açılan menüden **"Custom Domain"** seçin *(Route DEĞİL, Custom Domain!)*.
6. Kutuya ana domaininizi yazın: `materialguides.com` ve **Add Custom Domain** deyin.
7. Tekrar mavi **"+ Add"** > **"Custom Domain"** deyin ve bu sefer `www.materialguides.com` yazıp kaydedin.
8. Cloudflare SSL sertifikasını ve DNS yönlendirmesini 15-30 saniye içinde kendisi tamamlar. Siteniz HTTPS ile yayına girer.

---

### C. Yaşanan 2 Kritik Hata ve Çözüm Formülü

| Karşılaşılan Hata | Gerçek Sebebi | Anında Çözümü |
| :--- | :--- | :--- |
| **`Hostname already has externally managed DNS records (A, CNAME, etc)`** | Hostinger'ın park IP'si (`2.57.91.91`) hala Cloudflare DNS tablosunda duruyor veya site henüz Cloudflare tarafından "Active" onayını almamıştır. | **1.** Cloudflare Overview'dan *"Check nameservers now"* de.<br>**2.** DNS > Records'a git, domaininize ait eski `A` ve `CNAME` kayıtlarını **Delete (Sil)** yap.<br>**3.** Tekrar Custom Domain ekle. |
| **`Connection timed out (Error 522)`** | Custom Domain kullanmak yerine, elle "Workers Route" ekleyip DNS'e dummy IP girildiğinde Cloudflare arkada fiziksel bir origin sunucu arar ve zaman aşımına uğrar. | **1.** DNS'e manuel IP girmeyin.<br>**2.** Workers Route yerine doğrudan **Settings > Domains & Routes > Custom Domain** resmi özelliğini kullanın. Cloudflare sunucu aramadan doğrudan Edge üzerinden sitenizi açar. |


