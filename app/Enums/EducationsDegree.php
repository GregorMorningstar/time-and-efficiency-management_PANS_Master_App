<?php

namespace App\Enums;

enum EducationsDegree: string
{
    case PRIMARY   = 'primary';    // szkoła podstawowa
    case SECONDARY = 'secondary';  // liceum / technikum (ogólne)
    case VOCATIONAL = 'vocational';// szkoła zawodowa / branżowa
    case BACHELOR  = 'bachelor';   // licencjat
    case ENGINEER  = 'engineer';   // inżynier
    case MASTER    = 'master';     // magister
    case DOCTOR    = 'doctor';     // doktor

    public function label(): string
    {
        return match ($this) {
            self::PRIMARY   => 'Szkoła podstawowa',
            self::SECONDARY => 'Średnie',
            self::VOCATIONAL => 'Średnie zawodowe',
            self::BACHELOR  => 'Licencjat',
            self::ENGINEER  => 'Inżynier',
            self::MASTER    => 'Magister',
            self::DOCTOR    => 'Doktor',
        };
    }

    public static function selectOptions(): array
    {
        return array_map(
            fn(self $c) => ['value' => $c->value, 'label' => $c->label()],
            self::cases()
        );
    }
}
