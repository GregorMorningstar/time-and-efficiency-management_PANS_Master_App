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

    function translateLeaveTypeToPolish(string $leaveType): string {
    return match ($leaveType) {
        LeavesType::ANNUAL->value => 'Urlop wypoczynkowy',
        LeavesType::SICK->value => 'Urlop chorobowy',
        LeavesType::UNPAID->value => 'Urlop bezpłatny',
        LeavesType::MATERNITY->value => 'Urlop macierzyński',
        LeavesType::PATERNITY->value => 'Urlop tacierzyński',
        LeavesType::COMPASSIONATE->value => 'Urlop okolicznościowy',
        LeavesType::STUDY->value => 'Urlop szkoleniowy',
        default => 'Nieznany typ urlopu',
    };
}

            public static function selectOptions(): array
            {
                return array_map(
                    fn(self $c) => ['value' => $c->value, 'label' => (new self())->translateLeaveTypeToPolish($c->value)],
                    self::cases()
                );
            }
}
