<?php

namespace Database\Seeders;

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('qwer1234'),
                'role' => UserRole::ADMIN->value,
                'education_completed' => true,
                'experience_completed' => true,
                'address_completed' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'moderator@example.com'],
            [
                'name' => 'Moderator',
                'password' => Hash::make('qwer1234'),
                'role' => UserRole::MODERATOR->value,
                'education_completed' => true,
                'experience_completed' => false,
                'address_completed' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'employee@example.com'],
            [
                'name' => 'Pracownik 1',
                'password' => Hash::make('qwer1234'),
                'role' => UserRole::EMPLOYEE->value,
                'education_completed' => false,
                'experience_completed' => false,
                'address_completed' => false,
            ]
        );
    }
}
