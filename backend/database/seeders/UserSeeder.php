<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Technician;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Admin ─────────────────────────────────────────────────────────
        $admins = [
            ['name' => 'Muhammad Ragil',  'email' => 'ragil@telkomuniversity.ac.id',  'nim' => '103012300015'],
            ['name' => 'Daffa Fairuz',    'email' => 'daffa@telkomuniversity.ac.id',  'nim' => '103012300309'],
        ];

        foreach ($admins as $admin) {
            User::updateOrCreate(['email' => $admin['email']], [
                'name'     => $admin['name'],
                'password' => Hash::make('admin123'), // ganti setelah deploy
                'role'     => 'admin',
                'nim'      => $admin['nim'],
                'status'   => 'aktif',
                'must_change_password' => false,
            ]);
        }

        // ─── Teknisi ────────────────────────────────────────────────────────
        $teknisis = [
            ['name' => 'Budi Santoso',     'email' => 'bsantoso@telkomuniversity.ac.id',   'specialty' => 'Listrik & Lab',     'max_capacity' => 5],
            ['name' => 'Eko Prasetyo',     'email' => 'eprasetyo@telkomuniversity.ac.id',  'specialty' => 'Plumbing & HVAC',   'max_capacity' => 3],
            ['name' => 'Hendro Kurniawan', 'email' => 'hkurniawan@telkomuniversity.ac.id', 'specialty' => 'Lift & Mekanikal',  'max_capacity' => 3],
            ['name' => 'Slamet Riyadi',    'email' => 'sriyadi@telkomuniversity.ac.id',    'specialty' => 'Jaringan & IT',     'max_capacity' => 3],
            ['name' => 'Wahyu Pramono',    'email' => 'wpramono@telkomuniversity.ac.id',   'specialty' => 'Umum',              'max_capacity' => 3],
        ];

        foreach ($teknisis as $t) {
            $user = User::updateOrCreate(['email' => $t['email']], [
                'name'                 => $t['name'],
                'password'             => Hash::make('teknisi123'),
                'role'                 => 'teknisi',
                'status'               => 'aktif',
                'must_change_password' => true,
            ]);

            Technician::updateOrCreate(['user_id' => $user->id], [
                'specialty'           => $t['specialty'],
                'availability_status' => $t['name'] === 'Wahyu Pramono' ? 'cuti' : 'aktif',
                'max_capacity'        => $t['max_capacity'],
                'completed_count'     => rand(10, 35),
            ]);
        }

        // ─── Pelapor (dummy) ────────────────────────────────────────────────
        $pelapors = [
            ['name' => 'Ahmad Fauzi',  'email' => 'afauzi@student.telkomuniversity.ac.id',  'nim' => '10301230090'],
            ['name' => 'Siti Rahma',   'email' => 'srahma@student.telkomuniversity.ac.id',  'nim' => '10301230091'],
            ['name' => 'Reza Alif',    'email' => 'ralif@student.telkomuniversity.ac.id',   'nim' => '10301230095'],
            ['name' => 'Dewi Nastiti', 'email' => 'dnastiti@student.telkomuniversity.ac.id','nim' => '10301230097'],
            ['name' => 'Fajar Wibowo', 'email' => 'fwibowo@student.telkomuniversity.ac.id', 'nim' => '10301230099'],
        ];

        foreach ($pelapors as $p) {
            User::updateOrCreate(['email' => $p['email']], [
                'name'     => $p['name'],
                'password' => Hash::make('pelapor123'),
                'role'     => 'pelapor',
                'nim'      => $p['nim'],
                'status'   => $p['name'] === 'Reza Alif' ? 'nonaktif' : 'aktif',
            ]);
        }
    }
}
