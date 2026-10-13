# Plumbright

Ev projeleri için malzeme hesaplayıcıları ve rehberler. Astro 7 + Tailwind 4, tamamen statik site.

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
| `src/pages/` diğerleri | Güven sayfaları: about, author, contact, privacy, terms, disclaimer, editorial-policy, methodology, 404. |

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
