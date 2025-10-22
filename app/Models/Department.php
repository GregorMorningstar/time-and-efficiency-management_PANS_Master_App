<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
use HasFactory;

protected $fillable = [
    'barcode',
    'name',
    'description',
];


  protected static function booted()
    {
        // Use `self` here so the closure receives the actual model instance (App\Models\Educations)
        static::created(function (self $department) {
            if (! $department->barcode) {
                $prefix = '5000';
                $barcode = $prefix . str_pad((string) $department->id, 13 - strlen($prefix), '0', STR_PAD_LEFT);
                $department->updateQuietly(['barcode' => $barcode]);
            }
        });
    }

public function employees()
{
    return $this->hasMany(Employee::class);

}
public function machines()
{
    return $this->hasMany(Machine::class);
}
}
