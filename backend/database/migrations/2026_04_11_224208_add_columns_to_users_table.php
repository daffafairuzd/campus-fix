<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('pelapor')->after('email'); // admin | teknisi | pelapor
            $table->string('nim')->nullable()->after('role');
            $table->string('phone')->nullable()->after('nim');
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif')->after('phone');
            $table->boolean('must_change_password')->default(false)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'nim', 'phone', 'status', 'must_change_password']);
        });
    }
};
