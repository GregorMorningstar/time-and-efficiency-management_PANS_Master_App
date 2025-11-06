<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Machine extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'model',
        'year_of_production',
        'working_hours',
        'serial_number',
        'barcode',
        'description',
        'max_productions_per_hour',
        'department_id',
        'status',
        'image_path',
    ];


    protected static function booted()
    {
        // Use `self` here so the closure receives the actual model instance (App\Models\Educations)
        static::created(function (self $machine) {
            if (! $machine->barcode) {
                $prefix = '4400';
                $barcode = $prefix . str_pad((string) $machine->id, 13 - strlen($prefix), '0', STR_PAD_LEFT);
                $machine->updateQuietly(['barcode' => $barcode]);
            }
        });
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
