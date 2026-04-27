<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\TechnicianController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SlaController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| CampusFix API Routes
|--------------------------------------------------------------------------
*/

// --- Public Routes ---
Route::post('/auth/login',    [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// --- Protected Routes ---
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout',          [AuthController::class, 'logout']);
    Route::get('/auth/me',               [AuthController::class, 'me']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // Reports
    Route::get('/reports',                    [ReportController::class, 'index']);
    Route::post('/reports',                   [ReportController::class, 'store']);
    Route::get('/reports/{report}',           [ReportController::class, 'show']);
    Route::put('/reports/{report}',           [ReportController::class, 'update']);
    Route::delete('/reports/{report}',        [ReportController::class, 'destroy']);
    Route::post('/reports/{report}/status',   [ReportController::class, 'updateStatus']);
    Route::post('/reports/{report}/rate',     [ReportController::class, 'rate']);

    // Assignments
    Route::get('/assignments',                 [AssignmentController::class, 'index']);
    Route::post('/assignments',                [AssignmentController::class, 'store']);
    Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy']);

    // Technicians
    Route::get('/technicians',               [TechnicianController::class, 'index']);
    Route::put('/technicians/{technician}',  [TechnicianController::class, 'update']);

    // Users
    Route::get('/users',           [UserController::class, 'index']);
    Route::post('/users',          [UserController::class, 'store']);
    Route::put('/users/{user}',    [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    // SLA Tracking
    Route::get('/sla', [SlaController::class, 'index']);

    // Analytics
    Route::get('/analytics/overview', 'App\Http\Controllers\AnalyticsController@overview');
    Route::get('/analytics/weekly', 'App\Http\Controllers\AnalyticsController@weekly');
    Route::get('/analytics/monthly', 'App\Http\Controllers\AnalyticsController@monthly');
    Route::get('/analytics/categories', 'App\Http\Controllers\AnalyticsController@categories');
    Route::get('/analytics/technicians', 'App\Http\Controllers\AnalyticsController@technicianPerformance');
    Route::get('/analytics/reporters', 'App\Http\Controllers\AnalyticsController@topReporters');
    Route::get('/analytics/advanced-stats', 'App\Http\Controllers\AnalyticsController@advancedStats');

    // Notifications
    Route::get('/notifications',                        [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read',  [NotificationController::class, 'markRead']);
    // Notification read all
    Route::post('/notifications/read-all',              [NotificationController::class, 'markAllRead']);
});
