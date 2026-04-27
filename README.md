# Campus Fix Mobile App

Campus Fix adalah aplikasi pelaporan fasilitas kampus interaktif untuk lingkungan kampus (dirancang untuk Telkom University). Aplikasi ini memudahkan mahasiswa dan staf dalam melaporkan kerusakan fasilitas, serta membantu teknisi dalam mengelola perbaikan secara efisien.

Aplikasi ini memiliki sistem *Dark Mode* & *Light Mode* yang menggunakan palet warna dan tipografi (Space Grotesk) konsisten dengan Dashboard Admin Web Campus Fix.

## 🌟 Fitur Utama

### 🧑‍🎓 Akses Pelapor (Mahasiswa & Staf)
- **SSO Login:** Masuk menggunakan prefix ID SSO secara efisien.
- **Dashboard Interaktif:** Ringkasan statistik status laporan aktif dan riwayat.
- **Pelaporan Foto Instan:** Jepret foto bukti kerusakan menggunakan kamera langsung atau galeri.
- **Live Status Tracking:** Pantau perkembangan laporan melalui indikator proges visual (5 tahap).
- **Penilaian (Rating & Feedback):** Memberikan ulasan bintang dan umpan balik atas kualitas perbaikan teknisi.

### 🔧 Akses Teknisi
- **Daftar Tugas Berbasis AI:** Pekerjaan otomatis diurutkan berdasarkan skor prioritas AI dan urgensi.
- **Detail Laporan Bukti:** Akses koordinat lokasi dan data kerusakan yang dikirimkan pelapor.
- **Update & Bukti Penyelesaian:** Fitur pembaruan tahapan status dilengkapi unggah lampiran foto pasca-perbaikan.
- **Dashboard Kinerja Individu:** Visualisasi grafik bar perihal kecepatan SLA, penyelesaian mingguan, serta total akkumulasi rating teknisi.

## 🛠️ Tech Stack & Packages
- **Framework:** Flutter (Dart)
- **Fonts & Teks:** `google_fonts` (Space Grotesk)
- **Kamera & Media:** `image_picker`
- **Data Visualizations:** `fl_chart`
- **UI UX Khusus:** `flutter_rating_bar` (sistem rating), custom `shimmer` 
- **Local Storage:** `shared_preferences` (Data tema & sesi ringan)

## 🚀 Persiapan & Instalasi

1. Clone repositori dan masuk ke folder `mobile_app`.
2. Unduh semua depedency yang dibutuhkan:
   ```bash
   flutter pub get
   ```
3. Hubungkan perangkat Anda atau jalankan Android Emulator/Google Chrome.
4. Compile dan jalankan aplikasi:
   ```bash
   flutter run
   ```

## 🔐 Demo Akun (Sistem Mock API)
Aplikasi sementara ini dibangun dengan lapisan *Mock API* agar dapat dijalankan dan dieksplorasi tanpa harus terkoneksi ke backend.

Silakan gunakan sesi login demo berikut:
- **Akses Pelapor:**
  - SSO ID: `asep321` (Password: password)
  - SSO ID: `budi123` (Password: password)
- **Akses Teknisi:**
  - SSO ID: `teknisi01` (Password: password)
