# Panduan Setup FCM (Firebase Cloud Messaging)

Fitur push notification menggunakan FCM sudah diimplementasikan. Karena **private key Firebase tidak di-push ke repository**, setiap anggota tim perlu melakukan setup manual berikut setelah clone/pull.

---

## Yang Perlu Kamu Minta ke Pemilik Project

1. **File `firebase-credentials.json`** — service account private key dari Firebase Console  
2. **Password PostgreSQL** — untuk diisi di `.env` backend

---

## A. Setup Backend (Laravel)

### 1. Install dependencies
```bash
cd backend
composer install
```

### 2. Salin `.env`
```bash
cp .env.example .env   # atau buat manual .env dari contoh di bawah
php artisan key:generate
```

Isi minimal yang harus ada di `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=campusfix
DB_USERNAME=postgres
DB_PASSWORD=         # isi password PostgreSQL kamu

FIREBASE_CREDENTIALS=storage/app/firebase-credentials.json
```

### 3. Taruh file firebase-credentials.json
Letakkan file yang kamu terima dari pemilik project ke:
```
backend/storage/app/firebase-credentials.json
```
> File ini sudah ada di `.gitignore` dan tidak boleh di-commit.

### 4. Aktifkan ekstensi PHP
Buka file `php.ini` (biasanya di `C:\xampp\php\php.ini` atau `D:\xampp\php\php.ini`) dan pastikan baris berikut **tidak** dikomentari (hapus titik koma `;` di depannya):
```ini
extension=pdo_pgsql
extension=pgsql
extension=sodium
```
Restart Apache/server setelah mengubah `php.ini`.

### 5. Jalankan migrasi
```bash
php artisan migrate
```
> Ini akan menambahkan kolom `fcm_token` ke tabel `users`.

### 6. Jalankan server
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

---

## B. Setup Mobile (Flutter)

### 1. File `google-services.json` sudah ada di repo
File ini **aman untuk di-commit** (bukan private key) dan sudah tersedia di:
```
mobile_app/android/app/google-services.json
```
Tidak perlu melakukan apa-apa untuk file ini.

### 2. Install dependencies
```bash
cd mobile_app
flutter pub get
```

### 3. Sesuaikan IP backend
Buka file `mobile_app/lib/services/api_service.dart`, ubah `localIp` sesuai IP lokal laptop kamu:
```dart
const String localIp = '192.168.x.x';  // ganti dengan IP kamu
```
> IP bisa dicek dengan `ipconfig` (Windows) — cari bagian Wi-Fi, lihat IPv4 Address.

### 4. Jalankan aplikasi
```bash
flutter run
```

---

## Cara Kerja FCM di Project Ini

| Trigger | Siapa yang dapat notif | Tipe |
|---------|------------------------|------|
| Laporan baru dibuat | Semua admin | `new_report` (DB only, tidak ada push) |
| Teknisi di-assign ke laporan | Teknisi yang bersangkutan | Push + DB |
| Status laporan berubah | Pelapor pemilik laporan | Push + DB |

Push notification hanya dikirim ke **mobile (Android)**. Admin web menggunakan WebSocket (Reverb) untuk real-time update.

---

## Troubleshooting

**`could not find driver` saat migrate**  
→ Ekstensi `pdo_pgsql` belum aktif di `php.ini`. Lihat langkah A.4.

**`ext-sodium missing`**  
→ Ekstensi `sodium` belum aktif di `php.ini`. Lihat langkah A.4.

**Notif tidak diterima di HP**  
→ Pastikan `localIp` di `api_service.dart` sudah diisi IP laptop yang benar dan HP serta laptop terhubung ke Wi-Fi yang sama.

**App crash saat build Android**  
→ Jalankan `flutter clean` lalu `flutter pub get` dan coba lagi.
