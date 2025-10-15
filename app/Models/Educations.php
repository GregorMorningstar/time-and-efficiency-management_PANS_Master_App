<?php

namespace App\Models;

use App\Enums\EducationsDegree;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Educations extends Model
{
    protected $fillable = [
        'user_id',
        'school',
        'address',
        'zip_code',
        'city',
        'level',
        'start_date',
        'end_date',
        'start_year',
        'end_year',
        'diploma_path',
        'rodo_accepted',
        'rodo_accepted_at',
        'barcode',
        'verified',
        'is_current',
    ];

    protected $casts = [
        'start_date'      => 'date',
        'end_date'        => 'date',
        'level'           => EducationsDegree::class,
        'rodo_accepted'   => 'bool',
        'rodo_accepted_at'=> 'datetime',
    ];

    protected static function booted()
    {
        // Use `self` here so the closure receives the actual model instance (App\Models\Educations)
        static::created(function (self $education) {
            if (! $education->barcode) {
                $prefix = '8800';
                $barcode = $prefix . str_pad((string) $education->id, 13 - strlen($prefix), '0', STR_PAD_LEFT);
                $education->updateQuietly(['barcode' => $barcode]);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function levelLabel(): string
    {
        return $this->level instanceof EducationsDegree
            ? $this->level->label()
            : (string)$this->level;
    }
}
