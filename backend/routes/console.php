<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Report;
use App\Models\User;
use App\Models\Notification;
use App\Events\ReportSlaBreached;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    $overdueReports = Report::where('status', '!=', 'selesai')
        ->whereNotNull('sla_deadline')
        ->where('sla_deadline', '<=', now())
        ->get();

    $admins = User::where('role', 'admin')->get();

    foreach ($overdueReports as $report) {
        $alreadyNotified = Notification::where('report_id', $report->id)
            ->where('type', 'sla_breached')
            ->exists();

        if (!$alreadyNotified) {
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id'   => $admin->id,
                    'report_id' => $report->id,
                    'type'      => 'sla_breached',
                    'title'     => 'SLA Laporan Terlewati',
                    'message'   => "Laporan #{$report->report_number} ({$report->title}) telah melewati batas waktu SLA!",
                ]);
            }
            broadcast(new ReportSlaBreached($report));
        }
    }
})->everyMinute();
