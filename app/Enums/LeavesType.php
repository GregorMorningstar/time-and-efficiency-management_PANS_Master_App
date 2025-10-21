<?php
namespace App\Enums;


enum LeavesType: string
{
    case ANNUAL = 'annual';
    case SICK = 'sick';
    case UNPAID = 'unpaid';
    case MATERNITY = 'maternity';
    case PATERNITY = 'paternity';
    case COMPASSIONATE = 'compassionate';
    case STUDY = 'study';
    case CASUAL = 'casual';
    case REQUESTED = 'requested';

    function translateLeaveTypeToPolish(string $leaveType): string {
        return match ($leaveType) {
            LeavesType::ANNUAL->value => 'Urlop wypoczynkowy',
            LeavesType::SICK->value => 'Urlop chorobowy',
            LeavesType::UNPAID->value => 'Urlop bezpłatny',
            LeavesType::MATERNITY->value => 'Urlop macierzyński',
            LeavesType::PATERNITY->value => 'Urlop tacierzyński',
            LeavesType::COMPASSIONATE->value => 'Urlop okolicznościowy',
            LeavesType::STUDY->value => 'Urlop szkoleniowy',
            LeavesType::CASUAL->value => 'Urlop doraźny',
            LeavesType::REQUESTED->value => 'Urlop na żądanie',
            default => 'Nieznany typ urlopu',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::ANNUAL        => '#22c55e',
            self::SICK          => '#ef4444',
            self::UNPAID        => '#9ca3af',
            self::MATERNITY     => '#f59e0b',
            self::PATERNITY     => '#06b6d4',
            self::COMPASSIONATE => '#8b5cf6',
            self::STUDY         => '#3b82f6',
            self::CASUAL        => '#f97316',
            self::REQUESTED     => '#ea3333',
        };
    }

    public function label(): string
    {
        return $this->translateLeaveTypeToPolish($this->value);
    }

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }

    public static function selectOptions(): array
    {
        return array_map(
            fn(self $c) => ['value' => $c->value, 'label' => $c->label()],
            self::cases()
        );
    }
}
