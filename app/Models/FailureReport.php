<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FailureReport extends Model
{

    use HasFactory;
    protected $fillable = [
        'barcode',
        'user_id',
        'machine_id',
        'fault_range',
        'description',
        'failure_date',
        'reported_at',
        'status',
        'resolved_at',
    ];

     protected static function booted()
    {

        //barcode dla awarii maszyn prefik 4410
        static::created(function (self $machine) {
            if (! $machine->barcode) {
                $prefix = '4410';
                $barcode = $prefix . str_pad((string) $machine->id, 13 - strlen($prefix), '0', STR_PAD_LEFT);
                $machine->updateQuietly(['barcode' => $barcode]);
            }
        });
    }

    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
