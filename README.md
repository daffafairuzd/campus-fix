<div align="center">

# 🏫 Campus Fix

**Integrated Campus Facility Maintenance & Reporting System**

[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

*Campus Fix adalah platform terpadu yang dirancang guna mendigitalisasi pelaporan, penugasan, dan pemantauan perbaikan fasilitas kampus secara _real-time_.*

</div>

---

## 📖 Deskripsi Proyek

**Campus Fix** dirancang untuk mengatasi kompleksitas manajemen fasilitas di institusi pendidikan. Sistem ini terdiri dari tiga subsistem utama:
1. **Backend API (Laravel):** Menangani autentikasi, manajemen data, perhitungan SLA, dan WebSockets.
2. **Admin Web Dashboard (React.js):** Pusat kendali bagi Admin untuk memantau analitik dan menugaskan teknisi.
3. **Mobile Application (Flutter):** Aplikasi untuk Mahasiswa/Staf (sebagai Pelapor) dan Teknisi.

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
composer install
cp .env.example .env
php artisan key:generate

# Konfigurasi database di file .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD)

php artisan migrate:fresh --seed
php artisan db:seed --class=MassDataSeeder
php artisan serve
```

### 2. Setup Admin Web (React/Vite)
Buka terminal baru dan arahkan ke direktori `admin-web/`:
```bash
cd admin-web
npm install
npm run dev
```
*Web Admin berjalan di `http://localhost:5173`.*

### 3. Setup Mobile App (Flutter)
Buka terminal baru dan arahkan ke direktori `mobile_app/`:
```bash
cd mobile_app
flutter clean
flutter pub get
flutter run
```