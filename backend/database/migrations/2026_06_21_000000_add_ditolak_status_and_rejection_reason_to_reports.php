<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Tambah kolom rejection_reason
        Schema::table('reports', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable()->after('escalation_reason');
        });

        // Update constraint status untuk menambahkan 'ditolak'
        DB::statement('ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check');
        DB::statement("ALTER TABLE reports ADD CONSTRAINT reports_status_check CHECK (status::text = ANY (ARRAY['menunggu'::character varying, 'ditugaskan'::character varying, 'assessment'::character varying, 'dalam_proses'::character varying, 'selesai'::character varying, 'eskalasi'::character varying, 'ditolak'::character varying]::text[]))");
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn('rejection_reason');
        });

        DB::statement('ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check');
        DB::statement("ALTER TABLE reports ADD CONSTRAINT reports_status_check CHECK (status::text = ANY (ARRAY['menunggu'::character varying, 'ditugaskan'::character varying, 'assessment'::character varying, 'dalam_proses'::character varying, 'selesai'::character varying, 'eskalasi'::character varying]::text[]))");
    }
};
