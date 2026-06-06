<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the old constraint
        DB::statement('ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check');
        // Add the new constraint with 'assessment'
        DB::statement("ALTER TABLE reports ADD CONSTRAINT reports_status_check CHECK (status::text = ANY (ARRAY['menunggu'::character varying, 'assessment'::character varying, 'dalam_proses'::character varying, 'selesai'::character varying, 'eskalasi'::character varying]::text[]))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check');
        DB::statement("ALTER TABLE reports ADD CONSTRAINT reports_status_check CHECK (status::text = ANY (ARRAY['menunggu'::character varying, 'dalam_proses'::character varying, 'selesai'::character varying, 'eskalasi'::character varying]::text[]))");
    }
};
