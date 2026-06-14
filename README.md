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

## ✨ Fitur Utama

### 🛠️ Backend (Laravel)
- **Autentikasi & Manajemen User:** Sistem Multi-Role (Admin, Pelapor, Teknisi).
- **SLA Engine (Service Level Agreement):** Perhitungan otomatis tenggat waktu maksimal penyelesaian berdasarkan prioritas.
- **Real-Time WebSockets:** Integrasi **Laravel Reverb** untuk mem-*broadcast* pembaruan data secara instan ke Web Admin.
- **Sistem Notifikasi Pintar:**
  - **Email:** Mengirim OTP (*One Time Password*) untuk fitur Lupa Kata Sandi.
  - **Push Notification (FCM):** Mengirim notifikasi otomatis ke *smartphone* Pelapor (saat status berubah) dan Teknisi (saat mendapat tugas baru).

### 💻 Web Admin (React.js)
- **Dashboard Analitik:** Visualisasi status fasilitas kampus dan rasio penyelesaian laporan.
- **Live Ticket Board:** Tabel laporan yang ter-*update* secara otomatis (tanpa *refresh*) begitu ada laporan baru masuk dari aplikasi *mobile*.
- **Manajemen Penugasan:** Memantau kapasitas beban teknisi dan melakukan *assign* tugas langsung kepada ahlinya.

### 📱 Mobile App (Flutter)
- **Untuk Pelapor:**
  - Memfoto dan melokalisasi (GPS/Nama Gedung) fasilitas yang rusak.
  - Memantau riwayat Status laporan yang telah dibuat.
  - Sistem pemberian *Rating* & *Review* setelah laporan ditutup.
- **Untuk Teknisi:**
  - Menerima lembar tugas (*Ticketing*) langsung ke HP.
  - Mengubah status pengerjaan (Misal: dari *Ditugaskan* menjadi *Assessment* atau *Selesai*).
  - Melampirkan foto hasil perbaikan sebagai bukti penyelesaian.

---

## 🚀 Panduan Instalasi & Pengujian

Untuk panduan instalasi dan pengujian proyek secara lokal, silahkan akses Panduan Instalasi dan Konfigurasi project ini melalui link **Google Drive** yang telah kami cantumkan pada bagian **"Submission Comments" di LMS**.
