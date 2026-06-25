# Prompt Generate Activity Diagram untuk AI Agentic (Draw.io XML)

Gunakan teks prompt di bawah ini dan berikan kepada AI Agentic Coding (seperti Cursor, Devin, atau Antigravity) yang memiliki akses untuk membaca struktur direktori dan file di *project* Anda.

***

**Copy Prompt di Bawah Ini:**

```text
Kamu adalah AI Agentic System Analyst dan pakar Draw.io (mxGraphModel). Tugasmu adalah membuat Activity Diagram yang sangat akurat untuk project "Campus-Fix" yang ada di workspace ini.

Karena kamu adalah AI Agentic yang bisa membaca *source code*, kamu DILARANG berhalusinasi atau menebak-nebak alur. Lakukan langkah-langkah berikut secara berurutan:

**LANGKAH 1: Analisis Project (Wajib Dilakukan)**
Gunakan tool pencarian atau pembacaan file yang kamu miliki untuk menganalisis source code project ini guna menemukan alur bisnis riilnya:
1. Baca file `README.md` untuk memahami gambaran umum, 3 subsistem utama (Mobile Pelapor, Web Admin, Mobile Teknisi), dan fitur utamanya.
2. Baca file `backend/app/Http/Controllers/ReportController.php` secara detail untuk memahami:
   - Aktor yang terlibat.
   - Kondisi awal saat laporan dibuat.
   - Seluruh status transisi resmi (misal: 'menunggu', 'ditolak', 'ditugaskan', 'assessment', 'dalam_proses', 'eskalasi', 'selesai').
   - Aturan SLA dan eskalasi.
   - Persyaratan untuk menyelesaikan laporan (seperti kewajiban unggah 'bukti_penyelesaian').

**LANGKAH 2: Generate Activity Diagram (mxGraphModel)**
Setelah kamu memahami *flow* aslinya dari *source code*, buatkan Activity Diagram *End-to-End* (Mulai dari Pelapor submit laporan, Admin verifikasi/assign, Teknisi proses & eskalasi, hingga Pelapor memberikan rating).

**Instruksi Output & Format (SANGAT PENTING):**
- Hasilkan output murni berupa kode **XML draw.io (mxGraphModel)** yang terstruktur dan valid.
- Kode XML ini harus bisa langsung di-paste ke draw.io melalui fitur (Arrange -> Insert -> Advanced -> From Text).
- Gunakan *swimlane* (Pool "Sistem Campus-Fix" dengan 3 Lane: Pelapor, Admin, Teknisi) agar pemisahan tugas sangat jelas.
- Gunakan *shape* standar Activity Diagram (Start, Action, Decision/Diamond, Fork/Join, End).
- Berikan tata letak (geometry x, y) yang masuk akal dan dinamis agar diagram teratur rapi ketika di-paste.
- Keluarkan HANYA KODE XML di dalam code block, tanpa teks pengantar, penjelasan tambahan, atau peringatan apapun.
```
