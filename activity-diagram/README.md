# Daftar Activity Diagram — Campus-Fix

## Panduan Membaca Activity Diagram

### Bentuk-Bentuk (Shape)

| Bentuk | Nama | Keterangan |
|---|---|---|
| ● (Lingkaran hitam penuh) | **Initial Node (Start)** | Titik awal dari sebuah alur aktivitas. Setiap diagram memiliki tepat satu titik awal. |
| ◉ (Lingkaran hitam dengan ring) | **Final Node (End)** | Titik akhir dari sebuah alur aktivitas. Menandakan alur telah selesai. |
| ╭─────────╮ (Persegi panjang sudut bulat) | **Action / Activity** | Sebuah aksi atau aktivitas yang dilakukan oleh aktor. Contoh: "Input Email dan Password", "Submit Laporan". |
| ◇ (Belah ketupat / Diamond) | **Decision Node** | Titik percabangan keputusan. Berisi pertanyaan kondisi seperti "Valid?", "Sibuk?", "Disetujui?". |
| ║ Kolom vertikal ║ | **Swimlane** | Kolom yang memisahkan tanggung jawab masing-masing aktor (Pelapor, Admin, Teknisi, Sistem). |

### Arah Panah pada Percabangan (Decision)

| Arah Panah | Makna | Keterangan |
|---|---|---|
| ↓ Ke bawah | **Ya / Valid / Setuju** | Alur utama yang melanjutkan proses normal ke langkah berikutnya. |
| ← Ke kiri | **Tidak / Gagal / Ditolak** | Alur alternatif yang menandakan kondisi gagal, ditolak, atau error. |
| → Ke kanan | **Ya / Valid (alternatif)** | Alur yang menyilang ke aktor lain (misalnya dari Admin ke Sistem). |

### Jenis Garis Panah

| Garis | Nama | Keterangan |
|---|---|---|
| ── (Garis lurus solid) | **Control Flow** | Alur utama yang menghubungkan satu aktivitas ke aktivitas berikutnya secara berurutan. |
| ╌╌ (Garis putus-putus) | **Trigger / Side Effect** | Menandakan efek samping yang terjadi di sisi Sistem secara otomatis, seperti perubahan status di database. |
| ──→ (Panah menyilang antar kolom) | **Interaksi Antar Aktor** | Panah yang melewati batas swimlane, menandakan serah terima tugas atau informasi antar aktor yang berbeda. |

### Konvensi Umum

- **Alur dibaca dari atas ke bawah** (top-to-bottom).
- **Setiap kolom (swimlane)** mewakili satu aktor atau entitas.
- **Panah menyilang antar kolom** menunjukkan bahwa aktivitas berpindah dari satu aktor ke aktor lain.
- **Label pada panah percabangan** (seperti "Ya", "Tidak", "Valid", "Force") menjelaskan kondisi yang harus dipenuhi agar alur mengikuti arah tersebut.

---

## Daftar Activity Diagram

| No | Nama Activity Diagram | File | Aktor |
|---|---|---|---|
| 1 | Autentikasi dan Manajemen Akun | [1-autentikasi-dan-manajemen-akun.drawio](./1-autentikasi-dan-manajemen-akun.drawio) | Pengguna, Sistem |
| 2 | Pembuatan dan Pelacakan Laporan | [2-pembuatan-dan-pelacakan-laporan.drawio](./2-pembuatan-dan-pelacakan-laporan.drawio) | Pelapor, Sistem, Admin |
| 3 | Verifikasi dan Perhitungan SLA | [3-verifikasi-dan-perhitungan-sla.drawio](./3-verifikasi-dan-perhitungan-sla.drawio) | Admin, Sistem, Pelapor |
| 4 | Penugasan (Assignment) Teknisi | [4-penugasan-teknisi.drawio](./4-penugasan-teknisi.drawio) | Admin, Sistem, Teknisi |
| 5 | Pengerjaan dan Penyelesaian Fisik | [5-pengerjaan-dan-penyelesaian.drawio](./5-pengerjaan-dan-penyelesaian.drawio) | Teknisi, Sistem, Pelapor |
| 6 | Eskalasi Kendala Berat | [6-eskalasi-kendala-berat.drawio](./6-eskalasi-kendala-berat.drawio) | Teknisi, Admin, Sistem |
| 7 | Pemberian Rating dan Ulasan | [7-pemberian-rating-dan-ulasan.drawio](./7-pemberian-rating-dan-ulasan.drawio) | Pelapor, Sistem |
| 8 | Monitoring Analitik dan Kinerja | [8-monitoring-analitik-dan-kinerja.drawio](./8-monitoring-analitik-dan-kinerja.drawio) | Admin, Sistem |
