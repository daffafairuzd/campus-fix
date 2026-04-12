<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| CampusFix Broadcasting Channels
|--------------------------------------------------------------------------
*/

// Channel default Laravel
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Channel private per user (teknisi menerima notifikasi penugasan)
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Channel publik untuk semua admin (realtime report updates)
// Tidak perlu auth — semua user yang sudah login via Sanctum bisa subscribe
Broadcast::channel('reports', function ($user) {
    return $user->role === 'admin';
});
