# Plumbright

Ev projeleri için malzeme hesaplayıcıları ve rehberler.

**Stack:** Astro 7 (statik çıktı) · React 19 adacıkları · shadcn/ui (new-york, Radix) · Tailwind CSS 4 · Motion · Geist + Archivo yazı tipleri.

Sayfalar düz HTML olarak üretilir; JavaScript yalnızca hesaplayıcılar, tema düğmesi ve mobil menü için yüklenir. Hesaplayıcıların varsayılan sonuçları da HTML'in içindedir, yani arama motorları ve yapay zekâ tarayıcıları sonucu JavaScript çalıştırmadan görür.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # hesaplama testleri (30 test)
npm run build    # dist/ klasörüne statik site
```

Node 22 veya üstü gerekir.

## Yapı

| Klasör / dosya | Ne işe yarar |
| --- | --- |
| `src/site.config.js` | Marka adı, domain, e-posta, yazar bilgileri, menü. Domain değişirse sadece burayı değiştir. |
| `src/lib/tools.js` | 15 hesaplayıcının tek listesi. Menü, hesaplayıcılar sayfası, footer, yazı kenar kutusu, llms.txt ve yazı şemasındaki `tool` alanı buradan okunur. |
| `src/lib/calc/` | Hesaplama mantığı (beton, fayans+derz, boya, zemin, alçıpan, çakıl, deck, merdiven, çatı, alan, malç/toprak, çit, tuğla/blok/parke taşı, duvar kağıdı, halı). Tarayıcıda, build sırasında tablolarda ve testlerde aynı kod çalışır. |
| `tests/*.test.js` | Elle doğrulanmış örneklerle testler. Formül değiştirirsen önce testi güncelle. |
| `src/pages/*-calculator.astro` | Araç sayfaları: hesaplayıcı + formül + örnek + tablolar + SSS. |
| `src/content/guides/*.md` | Yazıların Markdown kaynağı; `push-guides` ile Supabase'e yüklenir. Supabase ayarlı değilse site doğrudan bunları kullanır. |
| `src/lib/articles-source.js` | Yazıları Supabase'den (ya da yerelden) okuyan tek nokta; içerik koleksiyonu ve sitemap bunu kullanır. |
| `supabase/` | Veritabanı şeması (migration) ve isteğe bağlı otomatik yayın tetikleyicisi. |
| `.github/workflows/deploy.yml` | Build, Cloudflare yükleme ve IndexNow; her gün ve her değişiklikte. |
| `src/components/ui/` | shadcn/ui bileşenleri (button, input, label, card, tabs, select, switch, separator, badge, dropdown-menu, sheet, tooltip, toggle-group). |
| `src/components/motion/` | Mikro animasyonlar: sonuç sayılarının yaylı geçişi (Motion Primitives'ten uyarlandı, MIT) ve kayan seçim göstergesi. Hareket azaltma tercihine uyar. |
| `src/components/calculators/` | Hesaplayıcı adacıkları. Girilen değerler adres çubuğuna yazılır, sonuç link olarak paylaşılabilir. |
| `scripts/make-images.mjs` | Paylaşım görseli (og.png) ve ikonları üretir. Marka adını değiştirince tekrar çalıştır. |
| `scripts/check-links.mjs` | Build sonrası: tüm iç linkler var mı, zamanlanmış bir yazı kendinden sonra yayınlanacak bir yazıya link veriyor mu. Deploy'da otomatik çalışır. |
| `scripts/reschedule.mjs` | Yayın tarihi kayarsa henüz yayınlanmamış yazıların tarihlerini sırasını bozmadan yeniden dağıtır. |
| `scripts/browser-check.mjs` | Gerçek tarayıcıda iki tema ve iki ekran genişliğinde ekran görüntüsü, taşma, konsol hatası ve etkileşim testleri. |
| `src/pages/` diğerleri | Güven sayfaları: about, author, contact, privacy, terms, disclaimer, editorial-policy, methodology, 404. |

## shadcn bileşeni eklemek

`components.json` hazır. Kendi bilgisayarında:

```bash
npx shadcn@latest add accordion
```

Tema renkleri `src/styles/global.css` içindeki `:root` ve `.dark` bloklarında. `--brand` (turuncu) sadece önemli sayılar ve ana vurgular için; sayfada iki yerden fazla kullanma.

## AEO / SEO / GEO

- Her araç sayfası ilk cümlede cevabı veriyor; altında tek başına alıntılanabilir "Key numbers" kutusu var.
- Şema: Organization, WebSite, Person, Article, BreadcrumbList, WebApplication.
- Başlıklara otomatik id ve "On this page" menüsü; görünür kaynaklar bölümü.
- `/llms.txt`: yapay zekâ asistanları için site özeti (Google buna ihtiyaç duymadığını söylüyor, diğer motorlar kullanabilir).
- `robots.txt` Googlebot ve AdSense tarayıcısına açık; site haritası otomatik.
- Open Graph ve Twitter kartları, her sayfada canonical, yayın ve güncelleme tarihleri.

## Tüm arama motorlarında ve yapay zekâlarda indekslenme

Kod tarafı hazır:
- `robots.txt` tüm arama motorlarına ve AI tarayıcılarına (Googlebot, Bingbot, Applebot, OAI-SearchBot, Claude-SearchBot, PerplexityBot, GPTBot, ClaudeBot, CCBot ve diğerleri) adıyla açık. İstemediğin satırı `src/pages/robots.txt.ts` içinden sil.
- Sitemap'te her sayfanın gerçek içerik tarihi `lastmod` olarak var. Tarihler `src/page-dates.js` (sayfalar) ve yazıların frontmatter'ı (`published` / `updated`) üzerinden geliyor. **Bir sayfanın tarihini sadece içeriği değiştiğinde güncelle**; Bing ve Google yeniden taramayı buna göre yapıyor.
- IndexNow: anahtar `src/site.config.js` içinde, `/indexnow-key.txt` adresinde yayında.
- Her sayfada `max-snippet:-1, max-image-preview:large` robots etiketi: arama motorları ve AI özetleri sayfadan istediği uzunlukta alıntı yapabilir.
- Doğrulama etiketleri için `SITE.verification` alanları hazır.

Yayına aldıktan sonra senin yapacakların:

1. **Google Search Console:** Domaini ekle (DNS doğrulaması en kolayı), `sitemap-index.xml` gönder. Google AI Overviews ve Gemini, Google dizinini kullanıyor.
2. **Bing Webmaster Tools:** "Import from Google Search Console" ile tek tıkla ekle. Sitemap'i gönder. Bing dizini Copilot'u ve DuckDuckGo sonuçlarını besliyor.
3. **IndexNow:** Her yayından sonra `npm run build && npm run indexnow -- --since YYYY-MM-DD` (o tarihten beri değişen sayfalar). Bing, Yandex, Seznam ve Naver'a anında bildirir. Google IndexNow kullanmaz, sitemap'i okur.
4. **Yandex Webmaster** (isteğe bağlı): ABD trafiği için şart değil.
5. **Cloudflare ayarları (kritik):** Cloudflare, reklam gösteren sayfalarda AI tarayıcılarını varsayılan olarak engelleyebiliyor ve robots.txt'ye kendi satırlarını ekleyebiliyor. Panelde **AI Crawl Control / Bots** bölümünde arama ve AI tarayıcılarının **izinli** olduğunu, "managed robots.txt" özelliğinin kapalı olduğunu kontrol et. Sonra `https://alanadin.com/robots.txt` adresini aç ve dosyanın bu projedekiyle aynı olduğunu doğrula.
6. **Kontrol:** Bing Webmaster Tools'taki URL denetimi ve Search Console'daki "URL Denetimi" ile birkaç sayfanın canlı halini test et.

Hiçbir araç bir sayfanın AI cevaplarında ne zaman ve nasıl görüneceğini garanti etmez; yapabileceğimiz, sayfaların taranabilir, güncel ve alıntılanabilir olmasını sağlamak.

## Backend: yazılar Supabase'de

```
Supabase (articles tablosu)  --build sırasında okunur-->  Astro  -->  statik HTML  -->  Cloudflare Pages
        ^                                                                                  |
        | push-guides.mjs (servis anahtarı, senin bilgisayarın)        IndexNow bildirimi <-+
```

- Yazılar Supabase'de durur, site **build sırasında** onları çeker ve düz HTML'e çevirir. Ziyaretçi ve tarayıcı tarafında Supabase'e hiç istek gitmez: hız, SEO ve güvenlik için en sağlam yol.
- Herkese açık okuma Row Level Security ile sınırlı: anonim anahtar sadece `status = 'published'` ve yayın zamanı geçmiş yazıları görür, hiçbir şey yazamaz.
- `published_at` ileri bir tarihse yazı zamanlanmış olur; günlük build o tarih gelince yayınlar. Yazıları 3–4 haftaya yaymak için bunu kullan.
- Bir yazının metni değişince `content_updated_at` otomatik atanır; sitedeki "Updated" tarihi ve sitemap `lastmod` buradan gelir. Sadece durum değişirse tarih değişmez.
- Supabase'e ulaşılamazsa build hata verir ve yayın yapılmaz; canlı site eski haliyle kalır. Yazısı eksik bir site asla yayına çıkmaz.
- Supabase ayarlı değilse (`.env` yoksa) site `src/content/guides/` içindeki Markdown dosyalarını kullanır. Aynı kural geçerli: taslaklar ve tarihi gelmemiş yazılar siteye girmez. Yazarken hepsini görmek için `PREVIEW_FUTURE=1 npm run dev`.

### Kurulum (bir kez)

1. supabase.com'da proje aç (bölge: ABD).
2. **SQL Editor**'de `supabase/migrations/` içindeki dosyaları sırayla çalıştır (`20261013000000_articles.sql`, `20261014000000_more_tools.sql`, `20261015000000_wave2_tools.sql`). Supabase CLI kullanıyorsan `supabase db push`.
3. **Project Settings > API**'den URL, `anon` ve `service_role` anahtarlarını al; `.env.example` dosyasını `.env` olarak kopyalayıp doldur.
4. Mevcut yazıları yükle: `npm run push-guides`.
5. GitHub reposunda **Settings > Secrets and variables > Actions**:
   - Secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CLOUDFLARE_API_TOKEN` (yetki: Cloudflare Pages: Edit), `CLOUDFLARE_ACCOUNT_ID`
   - Variable: `CLOUDFLARE_PAGES_PROJECT` (Pages proje adı)
   - Servis anahtarını buraya **koyma**; build'in buna ihtiyacı yok.
6. Cloudflare'de Pages projesini **Direct Upload** türünde oluştur (Git bağlantısı olmadan); yayını GitHub Actions yapıyor, iki ayrı build çakışmasın.
7. İsteğe bağlı: yazı değişince beklemeden yayın için `supabase/optional/deploy_on_change.sql` (içindeki adımları izle). Bu olmadan da her gün 13:05 UTC'de otomatik build var.

### Yeni yazı yayınlamak

1. `src/content/guides/` içine Markdown dosyası yaz (aşağıdaki şablon), `npm run dev` ile kontrol et.
2. Yayın tarihini `published` alanına yaz. Bugün ise hemen, ileri bir tarihse o gün yayınlanır. Taslak için `draft: true`.
3. `npm run push-guides yazi-adi` ile sadece o yazıyı yükle (`--dry-run` ile önce ne olacağını gör).
4. Yayın: anında (webhook kuruluysa), Actions sekmesinden elle ya da ertesi günkü otomatik build ile. Build sonrası IndexNow bildirimi otomatik.

Supabase panelinden de düzenleme yapabilirsin (Table Editor); kısıtlar hatalı slug, eksik açıklama ve tarihsiz yayını reddeder.

### Dosya şablonu

```markdown
---
title: "Başlık (en fazla 80 karakter)"
description: "Meta açıklama, 70–165 karakter."
published: 2026-10-20
tool: tile        # concrete | tile | paint | flooring | drywall | gravel | deck | stairs | roofing | area | mulch | fence | brick | wallpaper | carpet
---

İlk paragraf sorunun cevabı...
```

Kurallar:
- `published` gerçek yayın tarihi olsun; geriye tarih atma.
- Yazı dışında yeni bir sayfa eklersen tarihini `src/page-dates.js` dosyasına ekle; eklemezsen build hata verir.
- Tablolardaki rakamları elle yazma; `src/lib/calc/` fonksiyonlarını `node` ile çalıştırıp çıkan değerleri kullan.
- Bir yazıdan başka yazıya link verirken sadece **daha önce** yayınlanan yazılara link ver. `node scripts/check-links.mjs` bunu kontrol eder.
- Sadece değişen yazıyı yükle. Hepsini yeniden yüklemek zarar vermez, ama gereksiz build tetikler.

## Yayın takvimi (40 yazı)

2 yazı 13 Ekim'de, 23 yazı 14 Ekim – 9 Kasım arasında (onay dalgası), 15 yazı 10 – 26 Kasım arasında (ikinci dalga: malç, çit, tuğla/blok, duvar kağıdı, halı), Pazartesi–Cumartesi her gün bir tane olacak şekilde zamanlandı. Hepsini bugün Supabase'e yükleyebilirsin (`npm run push-guides`); her biri kendi tarihinde günlük build ile yayına girer ve IndexNow'a bildirilir.

Site bu tarihlerden sonra yayına girecekse, tarihleri kaydır ki hepsi aynı gün çıkmasın:

```bash
node scripts/reschedule.mjs 2026-11-16 --dry-run   # önce bak
node scripts/reschedule.mjs 2026-11-16             # uygula
npm run push-guides                                 # Supabase'i güncelle
```

`--per-week 4` ile haftada 4 yazıya düşürebilirsin. Sıra korunur, böylece yazılar arası linkler hep yayında olan yazıları gösterir.

## Yayına almadan önce yapılacaklar

- [ ] Domaini al ve `src/site.config.js` içinde `name`, `domain`, `url` alanlarını güncelle.
- [ ] Domain üzerinde gerçek bir e-posta aç ve `email` alanına yaz.
- [ ] `public/images/eren-simsir.jpg` olarak gerçek bir fotoğraf koy (yazar kutusu şu an baş harfleri gösteriyor).
- [ ] `src/pages/author/eren-simsir.astro` içindeki geçmiş bilgilerini gözden geçir; yayınlamak istemediğin satırı sil.
- [ ] `src/pages/editorial-policy.astro` içindeki yapay zekâ kullanımı paragrafının gerçek çalışma şeklini anlattığından emin ol.
- [ ] `src/pages/methodology.astro` içindeki "Sources" bölümünde her kaynağı kontrol ettiğin sayfaya linkle (yeni araçların kaynakları linkli; kalanlar: torba verimi ve boya kapsama oranı).
- [ ] İletişim formu istersen bir form servisi (Formspree, Basin vb.) aç ve `contactFormEndpoint` alanına URL'yi yaz.

## Yayın

Yayın `.github/workflows/deploy.yml` ile otomatik: testler, Supabase'den build, canlı sitede `noindex` kontrolü, Cloudflare Pages'e yükleme ve IndexNow bildirimi. Kurulum adımları yukarıda "Backend" bölümünde.

Cloudflare'de domaini Pages projesine bağladıktan sonra **AI Crawl Control / Bots** ayarlarını "Tüm arama motorlarında ve yapay zekâlarda indekslenme" bölümündeki gibi kontrol et.

## AdSense başvurusu

Başvuruyu 8–10 araç ve 20–25 yazı yayında ve indekslenmiş olduktan sonra yap (yaklaşık 5. hafta).

1. AdSense'te siteyi ekle; verilen yayıncı kimliğini (`ca-pub-...`) `adsensePublisherId` alanına yaz. Reklam kodu tüm sayfaların `<head>` bölümüne otomatik eklenir.
2. `public/ads.txt` dosyası oluştur: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
3. AdSense → Privacy & messaging bölümünden AB/İngiltere için Google'ın onay mesajını (CMP) aç. Gizlilik politikası bunu varsayıyor.
4. İnceleme sürerken sitede büyük yapı değişikliği yapma; yeni yazı eklemeye devam edebilirsin.
