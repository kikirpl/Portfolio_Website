# Portfolio 3D — Rizky Maulana Ibrohim

Situs portofolio satu halaman dengan pengalaman 3D ("Night Gallery"): setiap preview website menjadi layar yang melayang di ruang gelap dan memancarkan warnanya sendiri, kamera berjalan mengikuti scroll dari hero, galeri proyek, gerbang-gerbang pengalaman, sampai kontak.

- **Stack:** Astro 5 (output statis) + React Three Fiber / three.js, drei, postprocessing, Lenis.
- **Konten:** semua teks dan gambar berasal dari repo situs lama lewat skrip impor; tidak ada konten yang ditulis di komponen.
- **Tanpa WebGL / dengan "reduced motion" / tanpa JavaScript:** halaman yang sama tetap lengkap dalam versi 2D.

## Menjalankan

Butuh Node.js 22.12 atau lebih baru (lihat `.nvmrc`).

```bash
cd portfolio-3d
npm install
npm run dev
```

Buka http://localhost:4321. Perintah lain:

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi ke `dist/` |
| `npm run preview` | Menyajikan hasil build secara lokal |
| `npm run check` | Pemeriksaan tipe (Astro + TypeScript) |
| `npm run import` | Impor ulang konten dari repo sumber |

Parameter URL yang berguna saat mencoba: `?view=2d` / `?view=3d` (paksa versi 2D/3D), `?quality=low|medium|high` (paksa tingkat kualitas 3D).

## Konten dan impor ulang

Skrip `scripts/import-content.mjs` **hanya membaca** repo situs lama (Vue) dan menulis hasilnya ke `public/content/`:

```
public/content/
  profile.json      nama, sapaan, peran, kalimat hero, Tentang Saya, skills, CV, kontak
  projects.json     proyek + gambar (AVIF/WebP beberapa ukuran, tekstur WebGL 512/1024 px)
  experience.json   pengalaman (teks persis dari repo, plus tanggal yang bisa diurutkan)
  images/projects/  semua turunan gambar preview (nama file berisi hash isi)
  files/            CV (PDF)
IMPORT_REPORT.md    data yang perlu dilengkapi dan data janggal di repo sumber
public/og.png       kartu Open Graph (dibuat ulang setiap impor)
```

Jalankan ulang setiap kali isi repo lama berubah:

```bash
npm run import                                   # sumber = folder induk (repo ini)
npm run import -- --source ../portfolio_website  # checkout lokal lain
npm run import -- --git https://github.com/kikirpl/portfolio_website --ref master
npm run import -- --force                        # paksa encode ulang semua gambar
```

Gambar hanya di-encode ulang bila file sumbernya berubah, jadi impor ulang biasanya selesai dalam 1–2 detik. Setelah impor, commit perubahan di `public/content/`, `public/og.png`, dan `IMPORT_REPORT.md`.

**Melengkapi data yang kurang** (nama proyek tanpa data, link, menyembunyikan proyek, urutan pengalaman, menampilkan nomor HP) dilakukan di `content.overrides.json`, bukan di file hasil impor, supaya tidak hilang saat impor ulang. Isi file itu sudah diberi catatan per kolom. Daftar terkini hal yang perlu dilengkapi ada di `IMPORT_REPORT.md`.

Lokasi data di repo lama didefinisikan di bagian atas skrip impor (`SOURCE`). Kalau struktur situs lama berubah besar-besaran, cukup sesuaikan bagian itu.

## Struktur kode

```
src/
  pages/index.astro        halaman: semua konten sebagai HTML semantik
  components/              header, rail posisi, section, dialog proyek, loader, kursor
  data/content.ts          memuat + memvalidasi JSON konten saat build
  scripts/                 perilaku halaman tanpa framework (scroll, navigasi, dialog, dll.)
  lib/store.ts             state bersama halaman ↔ scene 3D
  three/                   scene WebGL (dimuat terpisah, hanya di mode 3D)
    layout.ts              tata letak dunia + framing kamera per section
    CameraRig.tsx          kamera mengikuti scroll / terbang ke detail proyek
    objects/               layar, cincin hero, galeri, gerbang pengalaman, beacon, lantai, partikel
    quality.ts             tingkat kualitas + penurunan otomatis saat FPS turun
scripts/                   skrip impor konten
```

## Performa dan aksesibilitas

- Kode 3D dimuat sebagai chunk terpisah hanya di mode 3D; versi 2D tidak pernah mengunduh three.js.
- Pixel ratio dibatasi per tingkat kualitas; `PerformanceMonitor` menurunkan kualitas (refleksi, bayangan, bloom, partikel, resolusi) saat FPS jatuh. Render berhenti saat tab tidak terlihat.
- Perangkat tanpa WebGL2 atau dengan renderer software (SwiftShader, llvmpipe) otomatis mendapat versi 2D. Pengunjung juga bisa pindah sendiri lewat tombol di footer.
- Semua konten ada di HTML (canvas hanya dekorasi, `aria-hidden`); setiap aksi 3D punya padanan tombol HTML; fokus keyboard terlihat; `prefers-reduced-motion` mematikan smooth scroll, animasi kamera, dan gerak dekoratif.

## Deploy

Situs ini statis; folder hasil build adalah `portfolio-3d/dist`. Atur `SITE_URL` (URL produksi) agar canonical, Open Graph, dan `sitemap.xml` memakai alamat absolut; di Netlify dan Vercel nilai ini terisi otomatis.

**Vercel:** Import repo → *Root Directory* = `portfolio-3d` → framework Astro terdeteksi otomatis → Deploy.

**Netlify:** repo ini punya `netlify.toml` di root yang mengarahkan build ke `portfolio-3d` (Node 22, `npm run build`, folder `dist`), jadi situs Netlify yang sudah tersambung langsung memakai versi baru tanpa mengubah pengaturan apa pun. Setiap pull request otomatis mendapat *deploy preview*. Untuk kembali ke situs lama, hapus `netlify.toml` di root. Kalau proyek ini dipindah ke repo sendiri, `portfolio-3d/netlify.toml` dipakai.

**GitHub Pages:** salin `deploy/github-pages.yml` ke `.github/workflows/deploy.yml` di root repo, lalu di *Settings → Pages* pilih sumber *GitHub Actions*. Workflow itu mengisi `SITE_URL` dan `BASE_PATH=/<nama-repo>/` (dibutuhkan karena situs berada di sub-path). Untuk domain kustom, pakai `BASE_PATH=/`.

## Kredit

- Huruf: [Archivo](https://github.com/Omnibus-Type/Archivo) (Omnibus-Type) dan [Martian Mono](https://github.com/evilmartians/mono) (Evil Martians), keduanya SIL Open Font License 1.1, via Fontsource.
- Ikon: digambar ulang dari [Lucide](https://lucide.dev) (lisensi ISC).
- Semua objek 3D dibuat prosedural di kode (tanpa model eksternal); tekstur lantai dan cahaya dibuat dengan canvas.
- Library: Astro, React, three.js, React Three Fiber, drei, @react-three/postprocessing, zustand, maath, Lenis (MIT); postprocessing (Zlib); sharp (Apache-2.0); unpdf, @vue/compiler-sfc, @babel/parser (MIT).
- Konten dan gambar preview milik Rizky Maulana Ibrohim, diambil dari repo `kikirpl/portfolio_website`.
