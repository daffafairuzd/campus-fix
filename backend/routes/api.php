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

// ─── Public Routes (tidak perlu auth) ────────────────────────────────────
Route::post('/auth/login',    [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']); // hanya pelapor

// ─── Protected Routes (butuh token Sanctum) ──────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout',          [AuthController::class, 'logout']);
    Route::get('/auth/me',               [AuthController::class, 'me']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // Reports — semua role bisa GET, hanya admin yg bisa DELETE
    Route::get('/reports',                    [ReportController::class, 'index']);
    Route::post('/reports',                   [ReportController::class, 'store']);
    Route::get('/reports/{report}',           [ReportController::class, 'show']);
    Route::put('/reports/{report}',           [ReportController::class, 'update']);
    Route::delete('/reports/{report}',        [ReportController::class, 'destroy']);
    Route::post('/reports/{report}/status',   [ReportController::class, 'updateStatus']);
    Route::post('/reports/{report}/rate',     [ReportController::class, 'rate']);

    // Assignments — admin only
    Route::get('/assignments',               [AssignmentController::class, 'index']);
    Route::post('/assignments',              [AssignmentController::class, 'store']);
    Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy']);

    // Technicians
    Route::get('/technicians',               [TechnicianController::class, 'index']);
    Route::put('/technicians/{technician}',  [TechnicianController::class, 'update']);

    // Users — admin only
    Route::get('/users',           [UserController::class, 'index']);
    Route::post('/users',          [UserController::class, 'store']);
    Route::put('/users/{user}',    [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    // SLA Tracking
    Route::get('/sla', [SlaController::class, 'index']);

    // Analytics / Dashboard
    Route::prefix('analytics')->group(function () {
        Route::get('/overview',    [AnalyticsController::class, 'overview']);
        Route::get('/weekly',      [AnalyticsController::class, 'weekly']);
        Route::get('/monthly',     [AnalyticsController::class, 'monthly']);
        Route::get('/categories',  [AnalyticsController::class, 'categories']);
        Route::get('/technicians', [AnalyticsController::class, 'technicianPerformance']);
    });

    // Notifications
    Route::get('/notifications',                        [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read',  [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all',              [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/delete-all',          [NotificationController::class, 'deleteAll']);
    Route::delete('/notifications/{notification}',      [NotificationController::class, 'destroy']);
});
