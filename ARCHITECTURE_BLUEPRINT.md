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

### A. Reklam & Cloudflare Hesap Bilgileri
* **Google AdSense Yayıncı Kimliği (Publisher ID):** `pub-4674211063760769`
* **Google AdSense Müşteri Kimliği:** `9067139789`
* **Cloudflare Account ID:** `500e418c58f83d22b8573faa44d2e71d`

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
7. **Bitti & Yayında:** GitHub Actions workflow'u tetiklenir veya bir commit atılır; site Cloudflare Pages üzerinden canlıya çıkar. Google Search Console'a `https://siteadi.com/sitemap-index.xml` verilir, 2-3 hafta sonra AdSense başvurusu yapılır.
