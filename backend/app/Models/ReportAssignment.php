<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportAssignment extends Model
{
    protected $fillable = [
        'report_id', 'technician_id', 'assigned_by', 'is_active', 'is_force_override',
    ];

    protected function casts(): array
    {
        return [
            'is_active'         => 'boolean',
            'is_force_override' => 'boolean',
        ];
    }

    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
