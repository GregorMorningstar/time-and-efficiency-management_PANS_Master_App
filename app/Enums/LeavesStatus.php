<?php


namespace App\Enums;

enum LeavesStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Oczekujący',
            self::APPROVED => 'Zatwierdzony',
            self::REJECTED => 'Odrzucony',
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
