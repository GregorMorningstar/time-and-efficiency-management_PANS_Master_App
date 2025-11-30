<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AddressEmployee extends Model
{
    protected $table = 'address_employees';

    // tabela bez timestamps w migracji => wyłącz automatyczne timestampy
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'street',
        'city',
        'house_number',
        'apartment_number',
        'zip_code',
        'country',
        'phone_number',
        'rodo_accept',
        'address_type',
        'id_card_number',
        'pesel',
        'id_card_scan',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
