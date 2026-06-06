<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Report;
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

        // Create 150 Reports
        $categories = ['Listrik & AC', 'Air & Pipa', 'Gedung & Fasilitas', 'IT & Jaringan', 'Kebersihan', 'Lainnya'];
        $priorities = ['kritis', 'tinggi', 'sedang', 'rendah'];
        $statuses = ['menunggu', 'assessment', 'dalam_proses', 'selesai', 'eskalasi'];

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
            'Listrik & AC' => [
                ['title' => 'AC mati mendadak', 'desc' => 'AC di ruangan tiba-tiba mati dan tidak bisa dinyalakan lagi dengan remote. Udara jadi sangat panas.'],
                ['title' => 'Lampu putus', 'desc' => 'Ada beberapa lampu yang mati sehingga ruangan menjadi gelap dan kurang nyaman untuk aktivitas.'],
                ['title' => 'Stop kontak tidak berfungsi', 'desc' => 'Stop kontak di area sudut ruangan tidak ada arusnya, sudah dicoba dengan beberapa perangkat.'],
                ['title' => 'AC bocor', 'desc' => 'Air menetes dari unit AC indoor hingga membasahi lantai, mohon segera ditangani agar tidak licin.'],
            ],
            'Air & Pipa' => [
                ['title' => 'Keran air patah', 'desc' => 'Keran wastafel patah dan air terus mengalir deras, butuh perbaikan segera sebelum banjir.'],
                ['title' => 'Saluran air mampet', 'desc' => 'Saluran pembuangan air tersumbat dan menimbulkan genangan air serta bau tidak sedap.'],
                ['title' => 'Air mati', 'desc' => 'Air di toilet tidak menyala sama sekali dari pagi hari.'],
            ],
            'Gedung & Fasilitas' => [
                ['title' => 'Gagang pintu rusak', 'desc' => 'Gagang pintu masuk ruangan copot dan pintunya jadi sulit untuk dibuka tutup.'],
                ['title' => 'Plafon bocor', 'desc' => 'Ada rembesan air dari plafon saat hujan deras kemarin, terlihat bercak coklat di langit-langit.'],
                ['title' => 'Kursi rusak', 'desc' => 'Ada beberapa kursi mahasiswa yang patah di bagian sandarannya, sangat berbahaya jika diduduki.'],
                ['title' => 'Kaca jendela retak', 'desc' => 'Kaca jendela di bagian ujung retak panjang, butuh penggantian sebelum pecah.'],
            ],
            'IT & Jaringan' => [
                ['title' => 'Koneksi WiFi lambat', 'desc' => 'Sinyal WiFi penuh tapi tidak bisa dipakai browsing sama sekali atau sangat lambat.'],
                ['title' => 'Proyektor tidak terdeteksi', 'desc' => 'Kabel HDMI sudah dipasang ke laptop tapi proyektor tetap menunjukkan no signal.'],
                ['title' => 'Kabel LAN terputus', 'desc' => 'Koneksi internet via kabel LAN di meja dosen tidak berfungsi, indikator port mati.'],
            ],
            'Kebersihan' => [
                ['title' => 'Area kotor belum disapu', 'desc' => 'Lantai terlihat sangat kotor seperti belum dibersihkan dari kemarin.'],
                ['title' => 'Tempat sampah penuh', 'desc' => 'Tempat sampah di area ini sudah penuh dan menumpuk hingga keluar, mohon segera diangkut.'],
                ['title' => 'Toilet bau', 'desc' => 'Toilet tercium bau tidak sedap dan lantainya licin kotor.'],
            ],
            'Lainnya' => [
                ['title' => 'Kunci ruangan macet', 'desc' => 'Anak kunci tersangkut di lubang kunci dan tidak bisa ditarik keluar.'],
                ['title' => 'Suara bising dari atap', 'desc' => 'Terdengar suara bising mesin yang mengganggu konsentrasi dari bagian atap ruangan.'],
            ]
        ];

        foreach ($users as $user) {
            // Each user creates 3 reports
            for ($j = 0; $j < 3; $j++) {
                $priority = $faker->randomElement($priorities);
                $status = $faker->randomElement($statuses);
                
                // Random creation date within last 3 months
                $createdAt = Carbon::now()->subDays(rand(0, 90));

                $building = $faker->randomElement(array_keys($telULocations));
                $location = $faker->randomElement($telULocations[$building]);
                $category = $faker->randomElement($categories);
                $issue = $faker->randomElement($realisticIssues[$category]);

                Report::create([
                    'title' => $issue['title'],
                    'description' => $issue['desc'],
                    'category' => $category,
                    'location' => $location,
                    'priority' => $priority,
                    'status' => $status,
                    'reporter_id' => $user->id,
                    'is_analyzed' => $status !== 'menunggu' ? true : $faker->boolean,
                    'sla_deadline' => $createdAt->copy()->addDays(rand(1, 7)),
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }
        }

        $this->command->info('MassDataSeeder completed: Created 50 users and 150 reports.');
    }
}
