<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MachineResponsibility extends Model
{

    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'barcode',
        'user_id',
        'machine_id',
        'machine_operation_id',
        'assigned_at',
        'released_at',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }



   protected static function booted()
    {
        //prefiks EAN-13 dla kodów kreskowych dla powiazania usera i maszyny
        static::created(function (self $machine) {
            if (! $machine->barcode) {
                $prefix = '4420';
                $barcode = $prefix . str_pad((string) $machine->id, 13 - strlen($prefix), '0', STR_PAD_LEFT);
                $machine->updateQuietly(['barcode' => $barcode]);
            }
        });
    }
}
