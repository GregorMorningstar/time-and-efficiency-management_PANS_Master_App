<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Leaves extends Model
{
use HasFactory;

    protected $fillable = [

        'user_id',
        'start_date',
        'end_date',
        'days',
        'type',
        'barcode',
        'status',
        'description',

    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

       protected static function booted()
    {
        static::created(function (self $education) {
            if (! $education->barcode) {
                $prefix = '7700';
                $barcode = $prefix . str_pad((string) $education->id, 13 - strlen($prefix), '0', STR_PAD_LEFT);
                $education->updateQuietly(['barcode' => $barcode]);
            }
        });
    }
}
