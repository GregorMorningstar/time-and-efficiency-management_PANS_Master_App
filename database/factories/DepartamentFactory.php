<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Departament;

class DepartamentFactory extends Factory
{
    protected $model = Departament::class;

    public function definition(): array
    {
        $names = [
            'Ślusarnia',
            'Magazyn surowców',
            'Magazyn wyrobów gotowych',
            'Spawalnia',
            'Lakiernia',
            'Montaż',
            'Kontrola jakości',
            'Utrzymanie ruchu',
            'Logistyka',
            'Administracja',
        ];

        return [
            'name' => $this->faker->unique()->randomElement($names),
            'description' => $this->faker->sentence(),
        ];
    }
}
