<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlaConfig extends Model
{
    protected $fillable = ['priority', 'response_hours', 'resolution_hours'];

    public static function forPriority(string $priority): ?self
    {
        return static::where('priority', $priority)->first();
    }
}
