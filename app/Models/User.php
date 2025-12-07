<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'email_verified_at',

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function educations()
    {
        return $this->hasMany(Educations::class);
    }

    public function experiences()
    {
        return $this->hasMany(Experiences::class);
    }

    public function leaves()
    {
        return $this->hasMany(Leaves::class);
    }


    public function machines()
    {
        return $this->hasMany(Machine::class);
    }
    public function addressEmployee()
    {
        return $this->hasMany(AddressEmployee::class);
    }
    public function failureReports()
    {
        return $this->hasMany(FailureReport::class, 'reported_by');
    }
    public function machineResponsibilities()
    {
        return $this->hasMany(MachineResponsibility::class);
    }
    //function


      protected static function booted()
    {
        static::created(function ($user) {
            $prefix = '9000';
            $id = $user->id;
            $barcode = $prefix . str_pad($id, 13 - strlen($prefix), '0', STR_PAD_LEFT);
            if ($user->barcode !== $barcode) {
                $user->barcode = $barcode;
                $user->save();
            }
        });
    }
}
