<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technicians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('specialty')->nullable();
            $table->enum('availability_status', ['aktif', 'cuti'])->default('aktif');
            $table->unsignedTinyInteger('max_capacity')->default(3);
            $table->unsignedInteger('completed_count')->default(0);
            $table->decimal('rating_avg', 3, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technicians');
    }
};
