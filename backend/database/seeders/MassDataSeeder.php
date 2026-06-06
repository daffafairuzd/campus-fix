<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Report;
use App\Models\ReportAssignment;
use App\Models\Technician;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class MassDataSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // Create 50 Users (Pelapor)
        $users = [];
        for ($i = 0; $i < 50; $i++) {
            $users[] = User::create([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => Hash::make('password'),
                'role' => 'pelapor',
                'nim' => $faker->numerify('103012#####'),
                'phone' => $faker->phoneNumber,
                'status' => 'aktif',
                'must_change_password' => false,
            ]);
        }

        // Ambil semua teknisi yang sudah ada (dari UserSeeder)
        $technicians = Technician::with('user')->get();
        $technicianUserIds = $technicians->pluck('user.id')->toArray();

        // Ambil admin untuk assigned_by
        $admin = User::where('role', 'admin')->first();

        // Create 150 Reports
        $categories = ['HVAC', 'Listrik', 'Lab', 'Plumbing', 'Jaringan', 'Lift', 'Lainnya'];
        $priorities = ['kritis', 'tinggi', 'sedang', 'rendah'];
        $statuses = ['menunggu', 'assessment', 'dalam_proses', 'selesai', 'eskalasi'];

        // Koordinat sekitar Tel-U Bandung
        $campusLat = -6.9731;
        $campusLng = 107.6312;

        $telULocations = [
            'Gedung SEBATIK' => ['Aula FIK Lantai 5'],
            'Gedung KAWALUSU' => ['Aula FKS Lantai 5'],
            'Gedung SELARU' => ['Aula FIT Lantai 4'],
            'TENNIS HALL' => ['Lapangan Tennis A', 'Lapangan Tennis B'],
            'Gedung BATEK_BTP' => ['Ruang MULMED Ged. A', 'Ruang MULMED Ged. C'],
            'TERAS PRIANGAN' => ['Outdoor class', 'PENDOPO PRIANGAN', 'Teras Outdoor', 'Joglo'],
            'TUCH' => ['Convention Hall'],
            'SPORT CENTER' => ['Skate Park', 'Lapangan Pickleball', 'Lapangan Basket 3X3 Utara', 'Lapangan Basket 3X3 Selatan', 'Lapangan Panahan', 'Lapangan Basket', 'Lapangan Volley', 'Lapangan Futsal'],
            'Gedung TULT' => ['Ruang kecil 1605', 'Area Makan TULT Lt.16', 'Ruang Rapat 1601', 'Ruang Rapat TULT 1602', 'Ruang Rapat TULT 1604', 'Auditorium TULT Lantai 16', 'Aula TULT Lt 2'],
            'Gedung GSG' => ['Sayap Kanan lantai 3', 'Sayap kiri lantai 3', 'Lapang samping timur GSG', 'Lapangan Upacara', 'Aula Besar Lt 1', 'VIP A', 'VIP B', 'VIP C'],
            'STUDENT CENTER' => ['Lapangan Bulutangkis A', 'Lapangan Bulutangkis B'],
            'Gedung MANTERAWU' => ['Aula Dekanat'],
            'Gedung MARATUA' => ['Aula FEB Lantai 5'],
            'GEDUNG DAMAR' => ['Auditorium Gedung Damar'],
            'GREEN LOUNGE' => ['Taman Green Lounge', 'Ruangan Green Lounge'],
        ];

        $realisticIssues = [
            'Listrik' => [
                ['title' => 'Lampu putus', 'desc' => 'Ada beberapa lampu yang mati sehingga ruangan menjadi gelap dan kurang nyaman.'],
                ['title' => 'Stop kontak rusak', 'desc' => 'Stop kontak tidak ada arusnya.'],
                ['title' => 'Listrik jeglek', 'desc' => 'MCB turun terus saat menyalakan komputer.'],
            ],
            'HVAC' => [
                ['title' => 'AC mati mendadak', 'desc' => 'AC tiba-tiba mati dan tidak bisa dinyalakan.'],
                ['title' => 'AC bocor', 'desc' => 'Air menetes dari unit AC indoor.'],
                ['title' => 'AC tidak dingin', 'desc' => 'AC menyala tapi anginnya kurang dingin.'],
            ],
            'Lab' => [
                ['title' => 'PC Lab error', 'desc' => 'Komputer di meja 3 tidak bisa masuk Windows.'],
                ['title' => 'Monitor bergaris', 'desc' => 'Layar monitor bergetar dan ada garis vertikal.'],
                ['title' => 'Software tidak lisensi', 'desc' => 'Aplikasi SPSS minta aktivasi.'],
            ],
            'Plumbing' => [
                ['title' => 'Keran air patah', 'desc' => 'Keran wastafel patah dan air terus mengalir.'],
                ['title' => 'Saluran mampet', 'desc' => 'Saluran pembuangan air tersumbat dan bau.'],
                ['title' => 'Air toilet mati', 'desc' => 'Air di toilet tidak menyala sama sekali dari pagi.'],
            ],
            'Jaringan' => [
                ['title' => 'Koneksi WiFi lambat', 'desc' => 'Sinyal WiFi penuh tapi tidak bisa dipakai browsing.'],
                ['title' => 'Kabel LAN terputus', 'desc' => 'Koneksi internet via kabel LAN tidak berfungsi.'],
                ['title' => 'SSID hilang', 'desc' => 'WiFi TUPublic tidak terdeteksi.'],
            ],
            'Lift' => [
                ['title' => 'Lift anjlok', 'desc' => 'Lift terasa turun mendadak saat di lantai 4.'],
                ['title' => 'Tombol lift macet', 'desc' => 'Tombol lantai 3 tidak bisa ditekan.'],
                ['title' => 'Pintu lift lambat', 'desc' => 'Pintu lift butuh waktu lama untuk menutup.'],
            ],
            'Lainnya' => [
                ['title' => 'Kunci ruangan macet', 'desc' => 'Anak kunci tersangkut di lubang kunci.'],
                ['title' => 'Suara bising atap', 'desc' => 'Terdengar suara bising mesin dari atap.'],
                ['title' => 'Gagang pintu copot', 'desc' => 'Gagang pintu utama ruangan copot.'],
            ]
        ];

        $completedCountPerTech = [];

        foreach ($users as $user) {
            // Each user creates 3 reports
            for ($j = 0; $j < 3; $j++) {
                $priority = $faker->randomElement($priorities);
                $status = $faker->randomElement($statuses);
                
                // Random creation date within the last 5 days so it falls in 'Bulan Ini'
                $createdAt = Carbon::now()->subDays(rand(0, 5));

                $building = $faker->randomElement(array_keys($telULocations));
                $location = $faker->randomElement($telULocations[$building]);
                $category = $faker->randomElement($categories);
                $issue = $faker->randomElement($realisticIssues[$category]);

                // SLA deadline: 1-7 hari setelah dibuat
                $slaDeadline = $createdAt->copy()->addDays(rand(1, 7));

                // closed_at & rating untuk laporan selesai
                $closedAt = null;
                $rating = null;
                $feedbackText = null;

                if ($status === 'selesai') {
                    // 70% tepat waktu (closed sebelum deadline), 30% terlambat
                    if ($faker->boolean(70)) {
                        // Tepat waktu: close 1-5 hari setelah dibuat, tapi sebelum deadline
                        $closedAt = $createdAt->copy()->addDays(rand(1, max(1, $slaDeadline->diffInDays($createdAt) - 1)));
                        if ($closedAt->gt($slaDeadline)) {
                            $closedAt = $slaDeadline->copy()->subHours(rand(1, 12));
                        }
                    } else {
                        // Terlambat: close setelah deadline
                        $closedAt = $slaDeadline->copy()->addDays(rand(1, 5));
                    }
                    
                    $rating = $faker->randomElement([3, 4, 4, 5, 5, 5]);
                    $feedbackText = $faker->randomElement([
                        'Perbaikan cepat dan memuaskan!',
                        'Teknisi ramah dan profesional.',
                        'Lumayan, tapi agak lama prosesnya.',
                        'Bagus, terima kasih atas penanganannya.',
                        'Cepat tanggap, sangat membantu.',
                        null,
                    ]);
                }

                // Latitude & Longitude random di sekitar kampus Tel-U
                $latitude = $campusLat + ($faker->randomFloat(4, -0.003, 0.003));
                $longitude = $campusLng + ($faker->randomFloat(4, -0.003, 0.003));

                $report = Report::create([
                    'title' => $issue['title'],
                    'description' => $issue['desc'],
                    'category' => $category,
                    'location' => $location,
                    'building' => $building,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'priority' => $priority,
                    'status' => $status,
                    'reporter_id' => $user->id,
                    'is_analyzed' => $status !== 'menunggu' ? true : $faker->boolean,
                    'sla_deadline' => $slaDeadline,
                    'closed_at' => $closedAt,
                    'rating' => $rating,
                    'feedback_text' => $feedbackText,
                    'created_at' => $createdAt,
                    'updated_at' => $closedAt ?? $createdAt,
                ]);

                // Assign teknisi untuk status assessment, dalam_proses, selesai, eskalasi
                if (in_array($status, ['assessment', 'dalam_proses', 'selesai', 'eskalasi']) && !empty($technicianUserIds)) {
                    $techUserId = $faker->randomElement($technicianUserIds);

                    ReportAssignment::create([
                        'report_id' => $report->id,
                        'technician_id' => $techUserId,
                        'assigned_by' => $admin ? $admin->id : $techUserId,
                        'is_active' => $status !== 'selesai',
                    ]);

                    // Track completed count
                    if ($status === 'selesai') {
                        if (!isset($completedCountPerTech[$techUserId])) {
                            $completedCountPerTech[$techUserId] = 0;
                        }
                        $completedCountPerTech[$techUserId]++;
                    }
                }
            }
        }

        // Update completed_count dan rating_avg di tabel technicians
        foreach ($technicians as $tech) {
            $userId = $tech->user->id;
            $assignedReportIds = ReportAssignment::where('technician_id', $userId)->pluck('report_id');
            
            $completedCount = Report::whereIn('id', $assignedReportIds)->where('status', 'selesai')->count();
            $avgRating = Report::whereIn('id', $assignedReportIds)->where('status', 'selesai')->whereNotNull('rating')->avg('rating');

            $tech->update([
                'completed_count' => $completedCount,
                'rating_avg' => $avgRating ? round($avgRating, 1) : null,
            ]);
        }

        $this->command->info('MassDataSeeder completed: Created 50 users and 150 reports with assignments, ratings & SLA data.');
    }
}
