<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $name = ['Hala A', 'Hala B', 'Magazyn Centralny', 'Magazyn Północny', 'Magazyn Południowy', 'Biuro Główne', 'Centrum Dystrybucyjne', 'Punkt Serwisowy', 'Warsztat Naprawczy', 'Stacja Kontroli Jakości'];
        return [

            'name' => $this->faker->randomElement($name),
            'address' => $this->faker->streetAddress,
            'city' => $this->faker->city,
            'zip_code' => $this->faker->postcode,

        ];
    }
}
