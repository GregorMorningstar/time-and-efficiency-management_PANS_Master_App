<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experiences extends Model
{

    protected $table = 'experiences';

    protected $fillable = [
        'user_id',
        'company_name',
        'position',
        'street',
        'zip_code',
        'city',
        'nip',
        'start_date',
        'end_date',
        'responsibilities',
        'is_current',
        'barcode',
        'work_certificate_scan_path',

    ];



      protected static function booted()
    {
        static::created(function ($user) {
            $prefix = '7000';
            $id = $user->id;
            $barcode = $prefix . str_pad($id, 13 - strlen($prefix), '0', STR_PAD_LEFT);
            if ($user->barcode !== $barcode) {
                $user->barcode = $barcode;
                $user->save();
            }
        });
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
