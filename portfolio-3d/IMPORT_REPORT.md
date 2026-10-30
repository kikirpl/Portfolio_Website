# Laporan impor konten

Dibuat otomatis oleh `npm run import`. Jangan diedit; isi data yang kurang di `content.overrides.json` lalu jalankan impor lagi.

- Sumber: `kikirpl/portfolio_website` @ `4df0527`
- Nama: Rizky Maulana Ibrohim
- Proyek: 10 tampil, 1 disembunyikan
- Pengalaman: 6 entri
- Tentang Saya: 2 paragraf
- Kontak: email, LinkedIn, GitHub

## Data yang perlu dilengkapi

- proyek "Edukode": daftar tech kosong di repo.
- Preview `portfolio-bangun.png` tidak punya data proyek. Nama sementara dari nama file: "Bangun". Lengkapi nama, deskripsi, tech, dan link di `content.overrides.json` → projects.bangun.
- Preview `portfolio-bumi.png` tidak punya data proyek. Nama sementara dari nama file: "Bumi". Lengkapi nama, deskripsi, tech, dan link di `content.overrides.json` → projects.bumi.
- Proyek `portfolio_v1` disembunyikan lewat `content.overrides.json` — lihat catatan di file itu.

## Data janggal di repo sumber (tidak diubah)

- proyek "MyGold Web3": link "github" (https://github.com/kikirpl) mengarah ke profil GitHub, bukan repo proyek. Ditampilkan sebagai "GitHub profile".
- proyek "PT. Pangan Makmur Nusantara": link "github" (https://github.com/kikirpl) mengarah ke profil GitHub, bukan repo proyek. Ditampilkan sebagai "GitHub profile".
- Penulisan nama tidak konsisten: "PT. Sanjungan Emas Mulia" (Pengalaman) vs "PT Sanjungan Emas Mulia" (Proyek). Tidak diubah.
- Penulisan nama tidak konsisten: "PT. Baraka Dhahabu Africa" (Pengalaman) vs "PT Baraka Dhahabu Africa" (Proyek). Tidak diubah.
- Level skill tidak konsisten: "Advance" dan "Advanced" dipakai bersamaan. Tidak diubah (level tidak ditampilkan di situs).
- File CV duplikat (isi identik): `CV-Rizky-Maulana-Ibrohim.pdf`, `cv-rizky-maulana-ibrohim (1).pdf`.
- Tombol "View/Download CV" di situs lama mengarah ke `/cv-rizky-maulana-ibrohim.pdf`, tapi file itu tidak ada (yang ada: `CV-Rizky-Maulana-Ibrohim.pdf`, `cv-rizky-maulana-ibrohim (1).pdf`). Di hosting yang peka huruf besar/kecil link ini rusak. Situs baru memakai `CV-Rizky-Maulana-Ibrohim.pdf`.
- File `public/Git-2.53.0.2-64-bit.exe` (61.6 MB) ikut dipublikasikan oleh situs lama dan membengkakkan repo. Tidak diimpor.
- Kemungkinan typo di peran hero "Profesional Trader": "Profesional" (maksudnya "Professional"?). Tidak diubah.

## Catatan impor

- File lain di `public/img` yang bukan preview website dan tidak diimpor: `IMG_0194.heic`, `kiki.jpg`.
- Link yang berisi teks 'null' di repo dianggap tidak ada: PT DIGITAL PANGAN NUSANTARA (github), Fortuna Meat X (github), Fortuna Poultry (github), PT Baraka Dhahabu Africa (github), PT Sanjungan Emas Mulia (github), Edukode (github).
- Urutan pengalaman di repo tidak kronologis; situs menampilkannya dari yang terbaru (bulan mulai). Ubah `experience.order` ke "source" di `content.overrides.json` untuk memakai urutan repo.
- Email dan LinkedIn diambil dari teks CV `CV-Rizky-Maulana-Ibrohim.pdf` (situs lama tidak punya halaman kontak).
- CV juga berisi nomor HP dan alamat rumah; keduanya tidak dipublikasikan (lihat `contact.showPhone`).
- Link LinkedIn di CV ditulis tanpa "https://" (www.linkedin.com/in/rizky-maulana-617a74296); situs menambahkan https:// pada link-nya.
- Kalimat hero diambil dari Tentang Saya: "I'm a Full-stack developer with 2+ years of experience building scalable web applications and Web3 platforms."
