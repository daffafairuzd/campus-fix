<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SlaConfigSeeder::class, // harus pertama (reports butuh SlaConfig)
            UserSeeder::class,
            ReportSeeder::class,
        ]);
    }
}
