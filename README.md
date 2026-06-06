<div align="center">

# 🏫 Campus Fix

**Integrated Campus Facility Maintenance & Reporting System**

[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

*Campus Fix adalah platform terpadu yang dirancang khusus untuk Telkom University guna mendigitalisasi pelaporan, penugasan, dan pemantauan perbaikan fasilitas kampus secara _real-time_.*

</div>

---

## 📖 Deskripsi Proyek

**Campus Fix** bukan sekadar aplikasi pelaporan biasa. Sistem ini dirancang untuk mengatasi kompleksitas manajemen fasilitas di institusi pendidikan berskala besar. Sistem ini terdiri dari tiga subsistem utama yang saling terhubung secara _real-time_:

1. **Backend API (Laravel):** Otak dari keseluruhan sistem yang menangani autentikasi, manajemen relasional data, perhitungan SLA (*Service Level Agreement*), hingga _broadcasting_ WebSocket (Laravel Reverb/Pusher) untuk notifikasi instan.
2. **Admin Web Dashboard (React.js):** Pusat kendali bagi pengelola fasilitas (Admin) untuk memantau analitik, menugaskan teknisi, menangani eskalasi, dan mengelola pengguna.
3. **Mobile Application (Flutter):** Aplikasi multi-peran untuk Mahasiswa/Staf (sebagai Pelapor) dan Teknisi. Dilengkapi fitur *Dark/Light Mode*, integrasi kamera, *geolocation*, dan notifikasi *real-time*.

---

## ✨ Fitur Kompleks & Arsitektur

### 🛠️ Fitur Backend (Laravel)
- **Role-Based Access Control (RBAC):** Memisahkan akses API secara aman antara `Admin`, `Teknisi`, dan `Pelapor`.
- **Dynamic SLA Tracking & Escalation:** Sistem secara cerdas menghitung batas waktu penyelesaian (SLA) berdasarkan prioritas laporan. Laporan yang melewati batas SLA otomatis dapat dieskalasi.
- **Real-Time Broadcasting:** Menggunakan WebSockets (Events/Broadcasting) agar Admin Web dan Mobile App mendapat *push notification* tanpa perlu me-refresh halaman.
- **Advanced Pagination & Filtering:** Endpoint API yang sangat dioptimasi (menggunakan Eager Loading) untuk menangani ribuan baris data laporan tanpa *bottleneck*.

### 🌐 Fitur Admin Web (React)
- **Dashboard Analitik Komprehensif:** Menyajikan grafik interaktif (menggunakan Recharts/Chart.js) untuk SLA *Compliance*, performa teknisi, dan rasio penyelesaian.
- **Manajemen Data Terpusat:** Pengaturan Laporan dan *Users* dengan kapabilitas pencarian, *filtering* ganda, dan *server-side pagination* yang dinamis (menampilkan 10, 20, hingga 50 baris).
- **Penugasan Cerdas (Smart Assignment):** Memungkinkan Admin untuk menunjuk teknisi berdasarkan spesialisasi dan status ketersediaan (Aktif/Cuti).

### 📱 Fitur Mobile App (Flutter)
- **Multi-Role Authentication:** Satu aplikasi untuk Pelapor dan Teknisi, menyajikan antarmuka berbeda tergantung tipe *login*.
- **UI/UX Modern & Responsif:** Desain bergaya *Glassmorphism*, dukungan transisi tema (*Dark/Light Mode*) secara *real-time*, dan animasi *micro-interactions* tingkat lanjut.
- **Bukti Multimedia & Lokasi:** Memanfaatkan `image_picker` dan `geolocator` untuk menangkap foto kerusakan dan titik koordinat gedung di lingkungan kampus.
- **Sistem Rating & Ulasan:** Alur penyelesaian laporan interaktif di mana pengguna wajib memberikan *rating* pada hasil kerja teknisi.

---

## 🚀 Panduan Instalasi (Setup Project)

Pastikan sistem Anda telah memiliki:
- **PHP** (v8.2+) & **Composer**
- **Node.js** (v18+) & **npm**
- **Flutter SDK** (v3.19+)
- **PostgreSQL** atau **MySQL**

### 1. Setup Backend (Laravel)
Buka terminal dan arahkan ke direktori `backend/`:
```bash
cd backend

# Install depedency
composer install

# Salin konfigurasi environment
cp .env.example .env

# Buat Application Key
php artisan key:generate

# Konfigurasi database di file .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD)

# Jalankan migrasi dan isi database dengan ribuan data percobaan (Mass Seeder)
php artisan migrate:fresh --seed
php artisan db:seed --class=MassDataSeeder

# (Opsional) Bersihkan seluruh cache untuk optimasi
php artisan optimize:clear

# Jalankan server
php artisan serve
```

### 2. Setup Admin Web (React/Vite)
Buka terminal baru dan arahkan ke direktori `admin-web/`:
```bash
cd admin-web

# Install depedency React
npm install

# Jalankan development server
npm run dev
```
*Web Admin akan berjalan di `http://localhost:5173`.*

### 3. Setup Mobile App (Flutter)
Buka terminal baru dan arahkan ke direktori `mobile_app/`:
```bash
cd mobile_app

# Bersihkan build cache lama dan ambil versi terbaru
flutter clean
flutter pub get

# Jalankan aplikasi (pilih emulator Android/iOS atau jalankan di Chrome/Edge)
flutter run
```

## 🌍 Panduan Deployment (Production)

Proyek ini telah dikonfigurasi dan dioptimasi untuk berjalan di _production environment_. Berikut langkah-langkah untuk melakukan deployment:

### 1. Backend (VPS / Shared Hosting)
1. Pindahkan _source code_ `backend/` ke direktori server Anda (misal: `/var/www/campus-fix-api`).
2. Pastikan file `.env` diubah modenya menjadi production:
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://api.campus-fix.telkomuniversity.ac.id
   ```
3. Install dependencies tanpa dev-packages: `composer install --optimize-autoloader --no-dev`
4. Jalankan optimasi Laravel (Cache, Config, Routes, Views):
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan event:cache
   ```
5. Konfigurasi _Web Server_ (Nginx/Apache) untuk menunjuk ke folder `public/`.
6. Atur *Supervisor* atau Daemon untuk menjalankan *Laravel Reverb* (`php artisan reverb:start`) dan *Queue Worker* (`php artisan queue:work`).

### 2. Admin Web (Vercel / Netlify / Nginx)
1. Buka folder `admin-web/` dan atur variabel lingkungan untuk Production di file `.env.production`:
   ```env
   VITE_API_URL=https://api.campus-fix.telkomuniversity.ac.id/api
   ```
2. Lakukan _build_ proyek:
   ```bash
   npm run build
   ```
3. Direktori `dist/` akan dihasilkan. Unggah seluruh isi direktori `dist/` ke layanan _hosting_ statis Anda (Vercel, Netlify) atau letakkan di direktori Nginx Anda.

### 3. Mobile App (Play Store / App Store)
1. Ubah _base URL_ pada `lib/services/api_service.dart` ke URL API Production Anda.
2. Build APK atau AppBundle untuk Android:
   ```bash
   flutter build apk --release
   # atau
   flutter build appbundle --release
   ```
3. Build untuk iOS:
   ```bash
   flutter build ipa --release
   ```

---

## 🔑 Demo Akses (Data dari Seeder)

Jika Anda sudah menjalankan `MassDataSeeder`, database akan terisi dengan 50 Pelapor dan 150 Laporan dari berbagai lokasi spesifik di Telkom University.

Anda dapat menggunakan akses _default_ (sesuaikan dengan seeder bawaan):
- **Admin**: `admin@telkomuniversity.ac.id` (Password: `password`)
- **Teknisi**: (Cek di panel web *Users* untuk melihat *email* dan *password* yang terdaftar)
- **Pelapor**: (Dapat membuat akun baru atau melihat email acak dari web admin dengan password `password`)

---

## 📂 Struktur Direktori Proyek

```
campus-fix/
├── admin-web/          # React.js SPA (Vite, Tailwind, Lucide React)
├── backend/            # Laravel 11 REST API (PostgreSQL/MySQL, Reverb, Sanctum)
└── mobile_app/         # Flutter Application (Dart, Provider/GetX, SharedPrefs)
```

<div align="center">
  <sub>Dibangun dengan dedikasi tinggi untuk memecahkan masalah manajemen fasilitas kampus.</sub>
</div>
