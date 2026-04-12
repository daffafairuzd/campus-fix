<?php

namespace Database\Seeders;

use App\Models\SlaConfig;
use Illuminate\Database\Seeder;

class SlaConfigSeeder extends Seeder
{
    public function run(): void
    {
        $configs = [
            ['priority' => 'kritis', 'response_hours' => 4,  'resolution_hours' => 24],
            ['priority' => 'tinggi', 'response_hours' => 8,  'resolution_hours' => 48],
            ['priority' => 'sedang', 'response_hours' => 24, 'resolution_hours' => 72],
            ['priority' => 'rendah', 'response_hours' => 48, 'resolution_hours' => 168],
        ];

        foreach ($configs as $config) {
            SlaConfig::updateOrCreate(['priority' => $config['priority']], $config);
        }
    }
}
