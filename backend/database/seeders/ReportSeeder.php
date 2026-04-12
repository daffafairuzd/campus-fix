<?php

namespace Database\Seeders;

use App\Models\Report;
use App\Models\ReportHistory;
use App\Models\ReportAssignment;
use App\Models\SlaConfig;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        $reporters = User::where('role', 'pelapor')->get()->keyBy('name');
        $admins    = User::where('role', 'admin')->get();
        $teknisis  = User::where('role', 'teknisi')->get()->keyBy('name');

        $admin = $admins->first();
        if (!$admin) return;

        $reports = [
            [
                'title'       => 'AC ruangan 301 mati total',
                'category'    => 'HVAC',
                'location'    => 'Gedung A Lt.3',
                'status'      => 'dalam_proses',
                'priority'    => 'kritis',
                'reporter'    => 'Ahmad Fauzi',
                'technician'  => 'Budi Santoso',
                'date'        => '2026-04-03 08:15:22',
                'description' => 'AC tidak mau menyala sama sekali meskipun sudah ganti remote dan dicolok ulang. Udara sangat panas mengganggu praktikum.',
                'histories'   => [
                    ['title' => 'Laporan dibuat', 'date' => '2026-04-03 08:15:22', 'user' => 'Ahmad Fauzi'],
                    ['title' => 'Teknisi ditugaskan: Budi Santoso', 'date' => '2026-04-03 09:30:45', 'user' => 'admin'],
                ],
            ],
            [
                'title'       => 'Lampu koridor B putus 3 titik',
                'category'    => 'Listrik',
                'location'    => 'Gedung B Lt.1',
                'status'      => 'selesai',
                'priority'    => 'rendah',
                'reporter'    => 'Siti Rahma',
                'technician'  => 'Eko Prasetyo',
                'date'        => '2026-04-01 19:40:11',
                'description' => 'Ada 3 buah lampu mati berurutan di sepanjang koridor, menjadikan area temaram ketika malam hari.',
                'rating'      => 4,
                'histories'   => [
                    ['title' => 'Laporan dibuat', 'date' => '2026-04-01 19:40:11', 'user' => 'Siti Rahma'],
                    ['title' => 'Teknisi ditugaskan: Eko Prasetyo', 'date' => '2026-04-01 20:15:00', 'user' => 'admin'],
                    ['title' => 'Laporan Selesai', 'date' => '2026-04-02 11:25:34', 'user' => 'Eko Prasetyo'],
                ],
            ],
            [
                'title'       => 'Proyektor Lab IF-2 tidak menyala',
                'category'    => 'Lab',
                'location'    => 'Lab IF Lt.2',
                'status'      => 'menunggu',
                'priority'    => 'tinggi',
                'reporter'    => 'Reza Alif',
                'technician'  => null,
                'date'        => '2026-04-04 07:12:05',
                'description' => 'Indikator power berkedip merah saat dinyalakan tapi lensa tidak mengeluarkan cahaya.',
                'histories'   => [
                    ['title' => 'Laporan dibuat', 'date' => '2026-04-04 07:12:05', 'user' => 'Reza Alif'],
                ],
            ],
            [
                'title'       => 'Toilet bocor basement parkir',
                'category'    => 'Plumbing',
                'location'    => 'Basement',
                'status'      => 'dalam_proses',
                'priority'    => 'tinggi',
                'reporter'    => 'Dewi Nastiti',
                'technician'  => 'Eko Prasetyo',
                'date'        => '2026-04-02 14:55:00',
                'description' => 'Pipa di atas plafon toilet rembes air cukup deras, mengenai jalur evakuasi.',
                'histories'   => [
                    ['title' => 'Laporan dibuat', 'date' => '2026-04-02 14:55:00', 'user' => 'Dewi Nastiti'],
                    ['title' => 'Teknisi ditugaskan: Eko Prasetyo', 'date' => '2026-04-02 15:30:17', 'user' => 'admin'],
                ],
            ],
            [
                'title'       => 'WiFi area kantin drop terus',
                'category'    => 'Jaringan',
                'location'    => 'Kantin Pusat',
                'status'      => 'menunggu',
                'priority'    => 'sedang',
                'reporter'    => 'Fajar Wibowo',
                'technician'  => null,
                'date'        => '2026-04-04 16:20:41',
                'description' => 'Sinyal wifi penuh tapi tidak bisa dipakai browsing, kemungkinan router hang.',
                'histories'   => [
                    ['title' => 'Laporan dibuat', 'date' => '2026-04-04 16:20:41', 'user' => 'Fajar Wibowo'],
                ],
            ],
            [
                'title'       => 'Lift gedung C error kode E3',
                'category'    => 'Lift',
                'location'    => 'Gedung C',
                'status'      => 'eskalasi',
                'priority'    => 'kritis',
                'reporter'    => 'Ahmad Fauzi',
                'technician'  => 'Hendro Kurniawan',
                'date'        => '2026-04-03 10:05:12',
                'description' => 'Pintu lift tidak mau tertutup, muncul tulisan error E3 di layar atas.',
                'escalated_at'=> '2026-04-04 09:00:00',
                'histories'   => [
                    ['title' => 'Laporan dibuat', 'date' => '2026-04-03 10:05:12', 'user' => 'Ahmad Fauzi'],
                    ['title' => 'Eskalasi Eksternal (Vendor)', 'date' => '2026-04-04 09:00:00', 'user' => 'admin'],
                ],
            ],
            [
                'title'       => 'Papan tulis smartboard rusak',
                'category'    => 'Lab',
                'location'    => 'Ruang 201',
                'status'      => 'selesai',
                'priority'    => 'sedang',
                'reporter'    => 'Fajar Wibowo',
                'technician'  => 'Budi Santoso',
                'date'        => '2026-03-30 13:45:22',
                'description' => 'Pointer tidak akurat dan perlu dikalibrasi tapi sistemnya dikunci PIN.',
                'rating'      => 5,
                'histories'   => [
                    ['title' => 'Laporan dibuat', 'date' => '2026-03-30 13:45:22', 'user' => 'Fajar Wibowo'],
                    ['title' => 'Teknisi ditugaskan: Budi Santoso', 'date' => '2026-03-31 08:30:00', 'user' => 'admin'],
                    ['title' => 'Laporan Selesai', 'date' => '2026-04-01 15:20:10', 'user' => 'Budi Santoso'],
                ],
            ],
            [
                'title'       => 'Genset cadangan tidak hidup',
                'category'    => 'Listrik',
                'location'    => 'Ruang Genset',
                'status'      => 'dalam_proses',
                'priority'    => 'kritis',
                'reporter'    => 'Ahmad Fauzi',
                'technician'  => 'Hendro Kurniawan',
                'date'        => '2026-04-04 22:15:05',
                'description' => 'Maintenance rutin mingguan, didapati aki genset B melemah.',
                'histories'   => [
                    ['title' => 'Laporan dibuat', 'date' => '2026-04-04 22:15:05', 'user' => 'Ahmad Fauzi'],
                    ['title' => 'Teknisi ditugaskan: Hendro Kurniawan', 'date' => '2026-04-04 22:45:30', 'user' => 'admin'],
                ],
            ],
        ];

        foreach ($reports as $idx => $data) {
            $reporterUser = $reporters->get($data['reporter']);
            if (!$reporterUser) continue;

            $slaConfig   = SlaConfig::forPriority($data['priority']);
            $createdAt   = Carbon::parse($data['date']);
            $slaDeadline = $slaConfig
                ? $createdAt->copy()->addHours($slaConfig->resolution_hours)
                : $createdAt->copy()->addDays(7);

            $report = Report::create([
                'report_number' => 'RPT-' . str_pad($idx + 1, 3, '0', STR_PAD_LEFT),
                'title'         => $data['title'],
                'description'   => $data['description'],
                'category'      => $data['category'],
                'location'      => $data['location'],
                'status'        => $data['status'],
                'priority'      => $data['priority'],
                'reporter_id'   => $reporterUser->id,
                'sla_deadline'  => $slaDeadline,
                'escalated_at'  => isset($data['escalated_at']) ? Carbon::parse($data['escalated_at']) : null,
                'closed_at'     => $data['status'] === 'selesai' ? $createdAt->copy()->addDays(1) : null,
                'rating'        => $data['rating'] ?? null,
                'created_at'    => $createdAt,
                'updated_at'    => $createdAt,
            ]);

            // Buat histories
            foreach ($data['histories'] as $h) {
                $histUser = $h['user'] === 'admin' ? $admin : $reporters->get($h['user']) ?? $teknisis->get($h['user']);
                ReportHistory::create([
                    'report_id'  => $report->id,
                    'user_id'    => $histUser?->id ?? $admin->id,
                    'title'      => $h['title'],
                    'created_at' => Carbon::parse($h['date']),
                    'updated_at' => Carbon::parse($h['date']),
                ]);
            }

            // Buat assignment jika ada teknisi
            if ($data['technician'] && $teknisis->has($data['technician'])) {
                $tech = $teknisis->get($data['technician']);
                ReportAssignment::create([
                    'report_id'     => $report->id,
                    'technician_id' => $tech->id,
                    'assigned_by'   => $admin->id,
                    'is_active'     => $data['status'] !== 'selesai',
                ]);
            }
        }
    }
}
