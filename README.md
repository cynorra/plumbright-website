# Plumbright

Ev projeleri için malzeme hesaplayıcıları ve rehberler.

**Stack:** Astro 7 (statik çıktı) · React 19 adacıkları · shadcn/ui (new-york, Radix) · Tailwind CSS 4 · Motion · Geist + Archivo yazı tipleri.

Sayfalar düz HTML olarak üretilir; JavaScript yalnızca hesaplayıcılar, tema düğmesi ve mobil menü için yüklenir. Hesaplayıcıların varsayılan sonuçları da HTML'in içindedir, yani arama motorları ve yapay zekâ tarayıcıları sonucu JavaScript çalıştırmadan görür.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # hesaplama testleri (11 test)
npm run build    # dist/ klasörüne statik site
```

Node 22 veya üstü gerekir.

## Yapı

| Klasör / dosya | Ne işe yarar |
| --- | --- |
| `src/site.config.js` | Marka adı, domain, e-posta, yazar bilgileri, menü. Domain değişirse sadece burayı değiştir. |
| `src/lib/calc/` | Hesaplama mantığı (beton, fayans, boya). Tarayıcıda, build sırasında tablolarda ve testlerde aynı kod çalışır. |
| `tests/calc.test.js` | Elle doğrulanmış örneklerle testler. Formül değiştirirsen önce testi güncelle. |
| `src/pages/*-calculator.astro` | Araç sayfaları: hesaplayıcı + formül + örnek + tablolar + SSS. |
| `src/content/guides/*.md` | Blog yazıları. |
| `src/components/ui/` | shadcn/ui bileşenleri (button, input, label, card, tabs, select, switch, separator, badge, dropdown-menu, sheet, tooltip, toggle-group). |
| `src/components/motion/` | Mikro animasyonlar: sonuç sayılarının yaylı geçişi (Motion Primitives'ten uyarlandı, MIT) ve kayan seçim göstergesi. Hareket azaltma tercihine uyar. |
| `src/components/calculators/` | Hesaplayıcı adacıkları. Girilen değerler adres çubuğuna yazılır, sonuç link olarak paylaşılabilir. |
| `scripts/make-images.mjs` | Paylaşım görseli (og.png) ve ikonları üretir. Marka adını değiştirince tekrar çalıştır. |
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

## Yeni yazı eklemek

`src/content/guides/` içine `yazi-adi.md` oluştur:

```markdown
---
title: "Başlık (en fazla 80 karakter)"
description: "Meta açıklama, 70–165 karakter."
published: 2026-10-20
tool: tile        # concrete | tile | paint
---

İlk paragraf sorunun cevabı...
```

Kurallar:
- `published` gerçek yayın tarihi olsun; geriye tarih atma.
- Yeni bir sayfa (yazı dışında) eklersen tarihini `src/page-dates.js` dosyasına da ekle; eklemezsen build hata verir.
- İçerik değişmediyse `updated` ekleme.
- Tablolardaki rakamları elle yazma; `node` ile `src/lib/calc/` fonksiyonlarını çalıştırıp çıkan değerleri kullan.
- Taslak için `draft: true` ekle; yayında görünmez.

## Yayına almadan önce yapılacaklar

- [ ] Domaini al ve `src/site.config.js` içinde `name`, `domain`, `url` alanlarını güncelle.
- [ ] Domain üzerinde gerçek bir e-posta aç ve `email` alanına yaz.
- [ ] `public/images/eren-simsir.jpg` olarak gerçek bir fotoğraf koy (yazar kutusu şu an baş harfleri gösteriyor).
- [ ] `src/pages/author/eren-simsir.astro` içindeki geçmiş bilgilerini gözden geçir; yayınlamak istemediğin satırı sil.
- [ ] `src/pages/editorial-policy.astro` içindeki yapay zekâ kullanımı paragrafının gerçek çalışma şeklini anlattığından emin ol.
- [ ] `src/pages/methodology.astro` içindeki "Sources" bölümünde her kaynağı kontrol ettiğin sayfaya linkle (torba verimi, boya kapsama oranı, IRC).
- [ ] İletişim formu istersen bir form servisi (Formspree, Basin vb.) aç ve `contactFormEndpoint` alanına URL'yi yaz.

## Cloudflare Pages ile yayın

1. Projeyi GitHub'a yükle.
2. Cloudflare Pages → Create project → GitHub reposunu seç.
3. Build command: `npm run build`, Output directory: `dist`, ortam değişkeni `NODE_VERSION=22`.
4. Custom domain bölümünden domaini bağla.
5. Cloudflare'de **Security → Bots** ayarlarında yapay zekâ/bot engelleme açıksa Googlebot ve AdSense tarayıcısının (Mediapartners-Google) engellenmediğini kontrol et.
6. Google Search Console'a domaini ekle, `https://alanadin.com/sitemap-index.xml` site haritasını gönder.

## AdSense başvurusu

Başvuruyu 8–10 araç ve 20–25 yazı yayında ve indekslenmiş olduktan sonra yap (yaklaşık 5. hafta).

1. AdSense'te siteyi ekle; verilen yayıncı kimliğini (`ca-pub-...`) `adsensePublisherId` alanına yaz. Reklam kodu tüm sayfaların `<head>` bölümüne otomatik eklenir.
2. `public/ads.txt` dosyası oluştur: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
3. AdSense → Privacy & messaging bölümünden AB/İngiltere için Google'ın onay mesajını (CMP) aç. Gizlilik politikası bunu varsayıyor.
4. İnceleme sürerken sitede büyük yapı değişikliği yapma; yeni yazı eklemeye devam edebilirsin.
