<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

$c = new \App\Http\Controllers\AnalyticsController();
$data = $c->advancedStats(new \Illuminate\Http\Request())->getData();
echo json_encode(['sla' => $data->sla, 'csat' => $data->csat]);
