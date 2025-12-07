<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MachineOperation extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'barcode',
        'machine_id',
        'operator_name',
        'operation_start_time',
        'operation_end_time',
        'pieces_per_hour',
        'setup_time_minutes',
        'oee_percent',
        'description',

    ];
}
