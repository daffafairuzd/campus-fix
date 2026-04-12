<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password',
        'role', 'nim', 'phone', 'status', 'must_change_password',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'must_change_password' => 'boolean',
        ];
    }

    // --- Role helpers ---
    public function isAdmin(): bool    { return $this->role === 'admin'; }
    public function isTechnician(): bool { return $this->role === 'teknisi'; }
    public function isReporter(): bool { return $this->role === 'pelapor'; }

    // --- Relationships ---
    public function technician()
    {
        return $this->hasOne(Technician::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    public function assignments()
    {
        return $this->hasMany(ReportAssignment::class, 'technician_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
