<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->onDelete('cascade');
            $table->foreignId('uploader_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('photo_data');           // base64 data URI: "data:image/jpeg;base64,..."
            $table->string('original_name', 255)->nullable();
            $table->string('mime_type', 50)->nullable();
            $table->enum('type', ['bukti_laporan', 'bukti_penyelesaian'])->default('bukti_laporan');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_photos');
    }
};
