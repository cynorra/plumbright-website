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

## 2. AdSense & SEO/AEO Onay Kuralları (Scale Ederken Değişmez İlkeler)

Yeni bir niş site açarken şu formülden asla sapılmamalıdır:

1. **Editoryal Öncelikli Ana Sayfa:** Sitenin ana sayfası sadece hesap makinesi/araç kutusu olmamalıdır. En üstte teknik rehberler ve makaleler (Hero + Featured Articles), hemen altında bu makalelerdeki formülleri çalıştıran yardımcı interaktif araçlar (Calculators) yer almalıdır.
2. **E-E-A-T (Deneyim, Uzmanlık, Otorite, Güvenilirlik):**
   * Yazar sayfası (`/author/[slug]/`) gerçek bir akademik/mühendislik biyografisi ve vesikalık fotoğrafla sunulmalıdır.
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

### C. Otomatik FAQ & Schema Üretici (`src/lib/toc.js` + `src/lib/schema.js`)
Sayfa içindeki soruları otomatik yakalar:
```javascript
// src/lib/toc.js içine eklenen FAQ ayrıştırıcı:
export function extractFaqItems(html) {
  const faqSection = html.split(/<h2[^>]*id="questions-people-ask"[^>]*>|<h2[^>]*>Questions people ask<\/h2>/i)[1];
  if (!faqSection) return [];
  const afterH2 = faqSection.split(/<h2[^>]*>/i)[0];
  const items = [];
  const regex = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = regex.exec(afterH2)) !== null) {
    const q = match[1].replace(/<[^>]+>/g, "").trim();
    const a = match[2].replace(/<[^>]+>/g, "").trim();
    if (q && a) items.push({ q, a });
  }
  return items;
}

// src/lib/schema.js içine eklenen FAQ şeması:
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

## 7. Yeni Niş Site Ölçekleme Kontrol Listesi (5 Dakikada Yeni Site)

Yeni bir fikir/niş belirlediğinde izlenecek adımlar:

1. **Repo Kopyalama:** Bu repo şablon olarak kopyalanır (`template repo`).
2. **Yapılandırma:** `src/site.config.js` içinde `SITE.name`, `SITE.domain` ve araç tanımları güncellenir.
3. **Supabase Aç:** Yeni bir Supabase projesi açılıp yukarıdaki **SQL şeması** yapıştırılır.
4. **İçerik:** 30-40 adet Markdown rehber `src/content/guides/` içine atılır ve `node scripts/push-guides.mjs` ile Supabase'e basılır.
5. **GitHub & Cloudflare:**
   * Cloudflare'de proje oluşturulur.
   * GitHub Secrets'a `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` girilir.
   * `CLOUDFLARE_PAGES_PROJECT` variable olarak tanımlanır.
6. **Bitti:** Proje canlıya alınır; Google Search Console'a sitemap verilir, 2-3 hafta sonra AdSense'e başvurulur.
