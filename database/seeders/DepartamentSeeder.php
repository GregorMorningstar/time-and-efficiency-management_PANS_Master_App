<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Department;


class DepartamentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed deterministic department names
        $names = [
            'Ślusarnia',
            'Magazyn surowców',
            'Magazyn wyrobów gotowych',
            'Spawalnia',
        ];

        foreach ($names as $name) {
            Department::firstOrCreate(
                ['name' => $name],
                ['description' => $name . ' department']
            );
        }
    }
}
