<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Report;
use App\Models\ReportAssignment;
use App\Models\ReportHistory;
use App\Models\Technician;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class MassDataSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // ─── Lokasi kampus Tel-U ─────────────────────────────────────────────
        $campusLat = -6.9731;
        $campusLng = 107.6312;

        $telULocations = [
            'Gedung TULT'       => ['Ruang kecil 1605', 'Area Makan TULT Lt.16', 'Ruang Rapat 1601', 'Auditorium TULT Lantai 16'],
            'Gedung GSG'        => ['Sayap Kanan lantai 3', 'Aula Besar Lt 1', 'VIP A', 'Lapangan Upacara'],
            'Gedung SELARU'     => ['Aula FIT Lantai 4'],
            'Gedung SEBATIK'    => ['Aula FIK Lantai 5'],
            'SPORT CENTER'      => ['Lapangan Basket', 'Lapangan Futsal', 'Lapangan Volley'],
            'Gedung MANTERAWU'  => ['Aula Dekanat'],
            'GEDUNG DAMAR'      => ['Auditorium Gedung Damar'],
            'GREEN LOUNGE'      => ['Taman Green Lounge', 'Ruangan Green Lounge'],
            'STUDENT CENTER'    => ['Lapangan Bulutangkis A', 'Lapangan Bulutangkis B'],
            'Gedung MARATUA'    => ['Aula FEB Lantai 5'],
        ];

        // ─── Konten laporan realistis ────────────────────────────────────────
        $realisticIssues = [
            'Listrik' => [
                ['title' => 'Lampu ruangan mati', 'desc' => 'Beberapa lampu di ruangan mati sehingga aktivitas terganggu dan ruangan menjadi gelap.'],
                ['title' => 'Stop kontak rusak', 'desc' => 'Stop kontak tidak ada arusnya saat digunakan untuk mengisi daya perangkat.'],
                ['title' => 'MCB turun terus', 'desc' => 'MCB selalu turun saat komputer dinyalakan bersamaan, mengganggu kegiatan belajar.'],
            ],
            'HVAC' => [
                ['title' => 'AC mati mendadak', 'desc' => 'AC tiba-tiba mati dan tidak bisa dinyalakan kembali. Ruangan terasa sangat panas.'],
                ['title' => 'AC bocor', 'desc' => 'Air menetes dari unit AC indoor membasahi lantai dan berpotensi menyebabkan kecelakaan.'],
                ['title' => 'AC tidak dingin', 'desc' => 'AC menyala namun hembusan angin tidak terasa dingin sama sekali.'],
            ],
            'Lab' => [
                ['title' => 'PC Lab tidak bisa booting', 'desc' => 'Komputer di meja 3 tidak bisa masuk Windows sama sekali sejak pagi tadi.'],
                ['title' => 'Monitor bergaris', 'desc' => 'Layar monitor bergetar dan ada garis vertikal yang mengganggu pandangan.'],
                ['title' => 'Software tidak bisa dibuka', 'desc' => 'Aplikasi SPSS meminta aktivasi ulang dan tidak bisa digunakan oleh mahasiswa.'],
            ],
            'Plumbing' => [
                ['title' => 'Keran air patah', 'desc' => 'Keran wastafel toilet patah dan air terus mengalir tidak bisa dihentikan.'],
                ['title' => 'Saluran mampet', 'desc' => 'Saluran pembuangan air toilet tersumbat dan mengeluarkan bau tidak sedap.'],
                ['title' => 'Air tidak mengalir', 'desc' => 'Air di toilet tidak mengalir sama sekali sejak pagi. Mahasiswa tidak bisa menggunakan toilet.'],
            ],
            'Jaringan' => [
                ['title' => 'WiFi sangat lambat', 'desc' => 'Sinyal WiFi terdeteksi penuh namun tidak bisa digunakan untuk browsing maupun download.'],
                ['title' => 'Kabel LAN terputus', 'desc' => 'Koneksi internet via kabel LAN di seluruh lab tidak berfungsi sejak kemarin.'],
                ['title' => 'SSID WiFi hilang', 'desc' => 'Jaringan WiFi TUPublic tidak terdeteksi di seluruh gedung, mempengaruhi kegiatan belajar.'],
            ],
            'Lift' => [
                ['title' => 'Lift anjlok tiba-tiba', 'desc' => 'Lift terasa turun mendadak saat berada di lantai 4, sangat berbahaya bagi penumpang.'],
                ['title' => 'Tombol lift tidak responsif', 'desc' => 'Tombol lantai 3 tidak bisa ditekan dan tidak ada respons saat ditekan berkali-kali.'],
                ['title' => 'Pintu lift lambat menutup', 'desc' => 'Pintu lift membutuhkan waktu yang sangat lama untuk menutup, menyebabkan antrian panjang.'],
            ],
            'Lainnya' => [
                ['title' => 'Kunci ruangan macet', 'desc' => 'Anak kunci tersangkut di lubang kunci dan tidak bisa dicabut sehingga ruangan tidak bisa diakses.'],
                ['title' => 'Suara bising dari atap', 'desc' => 'Terdengar suara bising dari mesin di atas plafon ruangan yang mengganggu konsentrasi.'],
                ['title' => 'Gagang pintu copot', 'desc' => 'Gagang pintu utama ruangan copot total sehingga pintu tidak bisa dibuka dari luar.'],
            ],
        ];

        $categories = array_keys($realisticIssues);

        // ─── Ambil data dari UserSeeder ──────────────────────────────────────
        $admin    = User::where('role', 'admin')->first();
        $pelapors = User::where('role', 'pelapor')->get();

        if ($pelapors->isEmpty()) {
            $this->command->error('Tidak ada user pelapor! Jalankan UserSeeder terlebih dahulu.');
            return;
        }

        $technicians = Technician::with('user')->get();

        if ($technicians->count() < 5) {
            $this->command->error('Teknisi tidak lengkap! Jalankan UserSeeder terlebih dahulu.');
            return;
        }

        // ════════════════════════════════════════════════════════════════════
        // Helper: buat satu laporan
        // ════════════════════════════════════════════════════════════════════
        $makeReport = function (
            string $status,
            string $priority,
            Carbon $createdAt,
            ?Carbon $closedAt = null,
            ?int $rating = null,
            ?string $feedbackText = null
        ) use ($faker, $telULocations, $realisticIssues, $categories, $campusLat, $campusLng, $pelapors) {
            $building  = $faker->randomElement(array_keys($telULocations));
            $location  = $faker->randomElement($telULocations[$building]);
            $category  = $faker->randomElement($categories);
            $issue     = $faker->randomElement($realisticIssues[$category]);

            // SLA deadline: 2–7 hari setelah dibuat
            $slaDeadline = $createdAt->copy()->addDays(rand(2, 7));

            $latitude  = $campusLat + $faker->randomFloat(4, -0.003, 0.003);
            $longitude = $campusLng + $faker->randomFloat(4, -0.003, 0.003);

            return Report::create([
                'title'         => $issue['title'],
                'description'   => $issue['desc'],
                'category'      => $category,
                'location'      => $location,
                'building'      => $building,
                'latitude'      => $latitude,
                'longitude'     => $longitude,
                'priority'      => $priority,
                'status'        => $status,
                'reporter_id'   => $faker->randomElement($pelapors)->id,
                'is_analyzed'   => $status !== 'menunggu',
                'sla_deadline'  => $slaDeadline,
                'closed_at'     => $closedAt,
                'rating'        => $rating,
                'feedback_text' => $feedbackText,
                'created_at'    => $createdAt,
                'updated_at'    => $closedAt ?? $createdAt,
            ]);
        };

        // ════════════════════════════════════════════════════════════════════
        // Helper: tambah history entry
        // ════════════════════════════════════════════════════════════════════
        $addHistory = function (
            int $reportId,
            int $userId,
            string $title,
            ?string $description = null,
            ?Carbon $at = null
        ) {
            ReportHistory::create([
                'report_id'   => $reportId,
                'user_id'     => $userId,
                'title'       => $title,
                'description' => $description,
                'created_at'  => $at ?? now(),
                'updated_at'  => $at ?? now(),
            ]);
        };

        // ════════════════════════════════════════════════════════════════════
        // 3 LAPORAN MENUNGGU — belum di-assign, tidak ada teknisi
        // ════════════════════════════════════════════════════════════════════
        $waitingData = [
            ['priority' => 'belum_ditentukan', 'daysAgo' => 1],
            ['priority' => 'belum_ditentukan', 'daysAgo' => 2],
            ['priority' => 'belum_ditentukan', 'daysAgo' => 3],
        ];

        foreach ($waitingData as $wd) {
            $createdAt = Carbon::now()->subDays($wd['daysAgo'])->subHours(rand(1, 5));
            $report    = $makeReport('menunggu', $wd['priority'], $createdAt);

            // History: laporan baru dibuat
            $addHistory($report->id, $report->reporter_id, 'Laporan dibuat',
                'Laporan baru masuk dan menunggu penugasan teknisi.', $createdAt);
        }

        $this->command->info('✅ 3 laporan MENUNGGU berhasil dibuat.');

        // ════════════════════════════════════════════════════════════════════
        // 15 LAPORAN TER-ASSIGN — 5 teknisi × 3 laporan masing-masing
        // Alur status resmi: menunggu → ditugaskan → assessment → dalam_proses → selesai/eskalasi
        // ════════════════════════════════════════════════════════════════════

        /**
         * Setiap baris = 1 teknisi, berisi 3 laporan dengan konfigurasi:
         * [status_akhir, priority, hari_lalu_dibuat]
         */
        $assignedMatrix = [
            // Budi Santoso — Listrik & Lab
            [
                ['status' => 'ditugaskan',   'priority' => 'tinggi',  'daysAgo' => 1],
                ['status' => 'assessment',   'priority' => 'sedang',  'daysAgo' => 3],
                ['status' => 'selesai',      'priority' => 'rendah',  'daysAgo' => 7],
            ],
            // Eko Prasetyo — Plumbing & HVAC
            [
                ['status' => 'assessment',   'priority' => 'kritis',  'daysAgo' => 2],
                ['status' => 'dalam_proses', 'priority' => 'tinggi',  'daysAgo' => 4],
                ['status' => 'selesai',      'priority' => 'sedang',  'daysAgo' => 9],
            ],
            // Hendro Kurniawan — Lift & Mekanikal
            [
                ['status' => 'ditugaskan',   'priority' => 'tinggi',  'daysAgo' => 1],
                ['status' => 'dalam_proses', 'priority' => 'kritis',  'daysAgo' => 5],
                ['status' => 'eskalasi',     'priority' => 'sedang',  'daysAgo' => 6],
            ],
            // Slamet Riyadi — Jaringan & IT
            [
                ['status' => 'assessment',   'priority' => 'sedang',  'daysAgo' => 2],
                ['status' => 'selesai',      'priority' => 'tinggi',  'daysAgo' => 8],
                ['status' => 'selesai',      'priority' => 'rendah',  'daysAgo' => 10],
            ],
            // Wahyu Pramono — Umum (status cuti, laporan lama)
            [
                ['status' => 'dalam_proses', 'priority' => 'tinggi',  'daysAgo' => 3],
                ['status' => 'eskalasi',     'priority' => 'kritis',  'daysAgo' => 7],
                ['status' => 'selesai',      'priority' => 'sedang',  'daysAgo' => 12],
            ],
        ];

        $feedbackPool = [
            'Perbaikan cepat dan memuaskan!',
            'Teknisi ramah dan profesional.',
            'Lumayan, tapi agak lama prosesnya.',
            'Bagus, terima kasih atas penanganannya.',
            'Cepat tanggap, sangat membantu.',
            'Pelayanan sangat baik, terima kasih.',
        ];

        foreach ($technicians as $techIdx => $tech) {
            $techUserId = $tech->user->id;
            $matrix     = $assignedMatrix[$techIdx];

            foreach ($matrix as $item) {
                $status   = $item['status'];
                $priority = $item['priority'];
                $daysAgo  = $item['daysAgo'];

                // Waktu pembuatan laporan
                $t0 = Carbon::now()->subDays($daysAgo)->setTime(rand(7, 10), rand(0, 59));

                // Waktu setiap transisi (bertahap, masing-masing +beberapa jam)
                $t1 = $t0->copy()->addHours(rand(1, 3));   // ditugaskan
                $t2 = $t1->copy()->addHours(rand(2, 6));   // assessment
                $t3 = $t2->copy()->addHours(rand(4, 12));  // dalam_proses / eskalasi
                $t4 = $t3->copy()->addHours(rand(6, 24));  // selesai

                // Tentukan closedAt dan rating untuk laporan selesai
                $closedAt    = null;
                $rating      = null;
                $feedbackText = null;

                if ($status === 'selesai') {
                    $closedAt     = $t4;
                    $rating       = $faker->randomElement([3, 4, 4, 5, 5, 5]);
                    $feedbackText = $faker->randomElement($feedbackPool);
                }

                // Buat laporan
                $report = $makeReport($status, $priority, $t0, $closedAt, $rating, $feedbackText);

                // ── Buat ReportAssignment ───────────────────────────────
                // is_active = true untuk semua status (termasuk selesai)
                // agar tampil sebagai "sudah di-assign" di panel admin
                ReportAssignment::create([
                    'report_id'      => $report->id,
                    'technician_id'  => $techUserId,
                    'assigned_by'    => $admin ? $admin->id : $techUserId,
                    'is_active'      => true,
                    'is_force_override' => false,
                ]);

                // ── Buat ReportHistory sesuai alur status ───────────────
                $adminId = $admin ? $admin->id : $techUserId;

                // [1] Laporan dibuat — selalu ada
                $addHistory($report->id, $report->reporter_id,
                    'Laporan dibuat',
                    'Laporan baru masuk dan sedang menunggu penugasan teknisi.',
                    $t0);

                // [2] Prioritas diverifikasi admin — selalu ada (karena is_analyzed = true)
                $addHistory($report->id, $adminId,
                    'Prioritas diverifikasi',
                    "Admin menentukan tingkat prioritas: " . ucfirst($priority) . ". SLA deadline telah ditetapkan.",
                    $t0->copy()->addMinutes(rand(30, 90)));

                // [3] Teknisi ditugaskan — selalu ada
                $addHistory($report->id, $adminId,
                    "Teknisi ditugaskan",
                    "Teknisi {$tech->user->name} ditugaskan untuk menangani laporan ini.",
                    $t1);

                // [4] Status: assessment — jika status >= assessment
                if (in_array($status, ['assessment', 'dalam_proses', 'selesai', 'eskalasi'])) {
                    $addHistory($report->id, $techUserId,
                        'Status diubah: ditugaskan → assessment',
                        'Teknisi melakukan kunjungan awal untuk menilai kondisi kerusakan di lapangan.',
                        $t2);
                }

                // [5] Status: dalam_proses — jika status >= dalam_proses atau eskalasi
                if (in_array($status, ['dalam_proses', 'selesai', 'eskalasi'])) {
                    $addHistory($report->id, $techUserId,
                        'Status diubah: assessment → dalam_proses',
                        'Asesmen selesai dilakukan. Perbaikan sudah dimulai oleh teknisi.',
                        $t3);
                }

                // [6a] Status: eskalasi — jika status = eskalasi
                if ($status === 'eskalasi') {
                    $addHistory($report->id, $techUserId,
                        'Mengajukan Eskalasi',
                        'Perbaikan memerlukan peralatan khusus atau bantuan pihak ketiga. Teknisi mengajukan eskalasi kepada admin.',
                        $t3->copy()->addHours(rand(1, 3)));

                    $addHistory($report->id, $adminId,
                        'Status diubah: dalam_proses → eskalasi',
                        'Admin menyetujui pengajuan eskalasi. Laporan diteruskan ke pihak yang berwenang.',
                        $t3->copy()->addHours(rand(3, 6)));
                }

                // [6b] Status: selesai — jika status = selesai
                if ($status === 'selesai') {
                    $addHistory($report->id, $techUserId,
                        'Status diubah: dalam_proses → selesai',
                        'Perbaikan telah selesai dilakukan. Foto bukti penyelesaian telah diunggah.',
                        $t4);

                    if ($rating !== null) {
                        $addHistory($report->id, $report->reporter_id,
                            "Pelapor memberikan rating: {$rating}/5",
                            $feedbackText ?? 'Pelapor memberikan penilaian terhadap penanganan laporan.',
                            $t4->copy()->addHours(rand(1, 24)));
                    }
                }
            }

            $this->command->info("✅ 3 laporan untuk teknisi [{$tech->user->name}] berhasil dibuat (dengan riwayat lengkap).");
        }

        // ─── Update statistik teknisi ────────────────────────────────────────
        foreach ($technicians as $tech) {
            $userId            = $tech->user->id;
            $assignedReportIds = ReportAssignment::where('technician_id', $userId)->pluck('report_id');

            $completedCount = Report::whereIn('id', $assignedReportIds)->where('status', 'selesai')->count();
            $avgRating      = Report::whereIn('id', $assignedReportIds)
                ->where('status', 'selesai')
                ->whereNotNull('rating')
                ->avg('rating');

            $tech->update([
                'completed_count' => $completedCount,
                'rating_avg'      => $avgRating ? round($avgRating, 1) : null,
            ]);
        }

        $this->command->info('');
        $this->command->info('════════════════════════════════════════════════════════');
        $this->command->info('  MassDataSeeder selesai!');
        $this->command->info('  Total laporan    : 18 (3 menunggu + 15 ter-assign)');
        $this->command->info('  Setiap teknisi   : 3 laporan masing-masing');
        $this->command->info('  Riwayat          : Lengkap per perubahan status');
        $this->command->info('  is_active        : true untuk semua assignment');
        $this->command->info('════════════════════════════════════════════════════════');
    }
}
