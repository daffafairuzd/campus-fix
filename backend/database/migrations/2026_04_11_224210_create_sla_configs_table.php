<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sla_configs', function (Blueprint $table) {
            $table->id();
            $table->enum('priority', ['kritis', 'tinggi', 'sedang', 'rendah'])->unique();
            $table->unsignedSmallInteger('response_hours');   // batas respon awal
            $table->unsignedSmallInteger('resolution_hours'); // batas penyelesaian
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sla_configs');
    }
};
