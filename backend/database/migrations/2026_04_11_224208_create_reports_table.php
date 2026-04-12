<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_number')->unique(); // RPT-001
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category'); // HVAC, Listrik, Lab, Plumbing, Jaringan, Lift, Bangunan, Umum
            $table->string('location');
            $table->string('building')->nullable();
            $table->string('floor')->nullable();
            $table->enum('status', ['menunggu', 'dalam_proses', 'selesai', 'eskalasi'])->default('menunggu');
            $table->enum('priority', ['kritis', 'tinggi', 'sedang', 'rendah'])->default('sedang');
            $table->json('photo_urls')->nullable(); // array URL Firebase Storage
            $table->json('proof_photo_urls')->nullable(); // foto bukti penyelesaian
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('sla_deadline')->nullable();
            $table->timestamp('escalated_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->unsignedTinyInteger('rating')->nullable(); // 1-5
            $table->text('feedback_text')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
