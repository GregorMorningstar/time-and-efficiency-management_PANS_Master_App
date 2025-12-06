<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Enums\LeavesType;
use Illuminate\Support\Facades\Auth;
use App\Services\VacationService;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class VacationCalendarController extends Controller
{
    public function __construct(private readonly VacationService $vacationService, private readonly User $user)
    {
    }

    public function index()
    {
        $userId = Auth::id();

        $types = LeavesType::selectOptions();

        $vacations = $this->vacationService->getUserVacations($userId);

        $events = collect($vacations)->map(function ($v) {
            $id   = is_array($v) ? ($v['id'] ?? null) : ($v->id ?? null);
            $start= is_array($v) ? ($v['start_date'] ?? null) : ($v->start_date ?? null);
            $end  = is_array($v) ? ($v['end_date'] ?? null) : ($v->end_date ?? null);
            $type = is_array($v) ? ($v['type'] ?? null) : ($v->type ?? null);
            $desc = is_array($v) ? ($v['description'] ?? '') : ($v->description ?? '');

            $endExclusive = $end ? Carbon::parse($end)->addDay()->toDateString() : null;

            $title = $type ? (method_exists(LeavesType::class, 'from') ? LeavesType::from($type)->translateLeaveTypeToPolish($type) : ucfirst($type)) : 'Urlop';
            $color = $type ? LeavesType::from($type)->color() : '#6366f1';

            return [
                'id' => $id,
                'title' => $title,
                'start' => $start,
                'end' => $endExclusive,
                'allDay' => true,
                'extendedProps' => [
                    'type' => $type,
                    'description' => $desc,
                ],
                'backgroundColor' => $color,
                'borderColor' => $color,
                'textColor' => '#ffffff',
            ];
        })->values()->all();

        return inertia('calendar/index', [
            'types' => $types,
            'events' => $events,
        ]);
    }


    public function store(Request $request)
    {
        $typeValues = array_map(fn($c) => $c->value, LeavesType::cases());

        // oblicz minimalną datę startu = 3 dni robocze od dziś (pomijamy weekendy)
        $minStart = Carbon::today();
        $added = 0;
        while ($added < 3) {
            $minStart->addDay();
            if (! $minStart->isWeekend()) {
                $added++;
            }
        }
        $minDateStr = $minStart->toDateString();

        $requestedType = $request->input('type');

        $rules = [
            'start_date'  => ['required', 'date'],
            'end_date'    => ['required', 'date', 'after_or_equal:start_date'],
            'type'        => ['required', 'string', Rule::in($typeValues)],
            'workingDays' => ['nullable','integer','min:0'],
            'description' => ['nullable','string','max:1000'],
            'reason'      => ['nullable','string','max:1000'],
        ];

        $exemptTypes = ['sick', 'requested'];
        if (! in_array($requestedType, $exemptTypes, true)) {
            $rules['start_date'][] = 'after_or_equal:'.$minDateStr;
        }

        $messages = [
            'start_date.after_or_equal' => "Wniosek musi być zgłoszony co najmniej 3 dni robocze przed rozpoczęciem urlopu (najwcześniejsza data: {$minDateStr}).",
        ];

        $validated = $request->validate($rules, $messages);

        $validated['days'] = (int) $request->input('workingDays', 0);
        $validated['user_id'] = Auth::id();

        $newVacation = $this->vacationService->createVacation($validated);

        return redirect()->back()->with('success', 'Vacation request created successfully.');
    }


    public function show($id)
    {
        $userId = Auth::id();

        $event = $this->vacationService->getVacationById($id);

        return inertia('calendar/event', [
            'event' => $event,
        ]);
    }

    public function checkVacationLimit($userId) {
            
    }
}
