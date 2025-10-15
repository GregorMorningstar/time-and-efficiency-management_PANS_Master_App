<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Leaves extends Model
{
use HasFactory;

    protected $fillable = [

    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
