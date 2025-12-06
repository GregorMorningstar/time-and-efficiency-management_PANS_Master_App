<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Educations;
use App\Models\EducationsDegree;
use App\Enums\EducationsDegree as EducationsDegreeEnum;
use App\Services\EducationService;
use App\Services\FlagsService;

class EducationController extends Controller
{
    protected $service;
    protected $flagsService;

    public function __construct(EducationService $service, FlagsService $flagsService)
    {
        $this->service = $service;
        $this->flagsService = $flagsService;
    }

    public function index()
    {
        $educations = $this->service->paginatedFor(request()->user(), 20);

        $educationLevels = EducationsDegreeEnum::selectOptions();
        $maxEducationLevel = $this->service->highestEducationForUser(request()->user());
        if (empty($educationLevels) && Schema::hasTable('education_degrees')) {
            $educationLevels = DB::table('education_degrees')
                ->orderBy('id')
                ->get()
                ->map(fn($r) => ['value' => $r->id, 'label' => $r->name])
                ->toArray();

        }
      
//dd($maxEducationLevel);
        return Inertia::render('education/education', [
            'educations'      => $educations,
            'educationLevels' => $educationLevels,
            'highestEducationLabel' => $maxEducationLevel,
        ]);
    }

    public function addEducation()
    {
        // Prefer enum-backed options; fall back to DB table if enum not available.
        $educationLevels = EducationsDegreeEnum::selectOptions();

        // If enum isn't available or returns empty, try the DB table as fallback
        if (empty($educationLevels) && Schema::hasTable('education_degrees')) {
            $educationLevels = DB::table('education_degrees')
                ->orderBy('id')
                ->get()
                ->map(fn($r) => ['value' => $r->id, 'label' => $r->name])
                ->toArray();
        }

        return Inertia::render('education/add-education', [
            'educationLevels' => $educationLevels,
        ]);
    }

    public function store(Request $request)
    {
        \Log::info('Education.store: incoming', [
            'raw' => $request->all(),
            'hasFile' => $request->hasFile('diploma'),
            'method' => $request->method(),
            'content_type' => $request->header('content-type'),
        ]);

        // Normalize input similar to update()
        $input = $request->all();
        $input['is_current'] = $request->boolean('is_current');
        if (!empty($input['is_current'])) {
            $input['end_date'] = null;
            $input['end_year'] = null;
        }

        $rules = [
            'school'      => 'required|string|min:2|max:255',
            'is_current'  => 'boolean',
            'address'     => 'nullable|string|max:255',
            'zip_code'    => 'nullable|regex:/^[0-9]{2}-?[0-9]{3}$/',
            'city'        => 'required|string|min:2|max:120',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'level'       => 'required|string',
            'diploma'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
            'rodo_accept' => 'accepted',
        ];

        $validator = \Validator::make($input, $rules);
        if ($validator->fails()) {
            \Log::info('Education.store: validation_failed', [
                'errors' => $validator->errors()->toArray(),
                'input_sample' => array_intersect_key($request->all(), array_flip(['school','city','start_date','end_date','level','is_current','zip_code'])),
            ]);
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        $this->service->createEducation($request->user(), $validated, $request->file('diploma'));

        // Przy dodaniu edukacji przez employee tylko ustawiamy flagę completed na true
        if (! $request->user()->education_completed) {
            $request->user()->forceFill(['education_completed' => true])->save();
        }

        return redirect()->route('employee.education')->with('success', 'Szkoła dodana.');
    }

   public function destroy(Request $request, int $id)
    {
        $user = Auth::user();

        $deleted = $this->service->deleteEducationForUser($id, $user->id);

        if (! $deleted) {
            return redirect()->back()->with('error', 'Nie znaleziono wpisu lub brak uprawnień.');
        }

        // Przy usunięciu synchronizuj tylko flagę education_completed (nie lata - te aktualizuje moderator)
        $this->flagsService->syncUserEducationFlag($user->id);

        return redirect()->back()->with('success', 'Wpis edukacji usunięty.');
    }

    /**
     * Usuń edukację przez POST z body { id }
     */
    public function destroyViaPost(Request $request)
    {
        $id = (int) $request->input('id', 0);
        $user = Auth::user();

        if (! $id) {
            return redirect()->back()->with('error', 'Brak ID wpisu do usunięcia.');
        }

        $deleted = $this->service->deleteEducationForUser($id, $user->id);

        if (! $deleted) {
            return redirect()->back()->with('error', 'Nie znaleziono wpisu lub brak uprawnień.');
        }

        // Przy usunięciu synchronizuj tylko flagę education_completed (nie lata - te aktualizuje moderator)
        $this->flagsService->syncUserEducationFlag($user->id);

        return redirect()->route('employee.education')->with('success', 'Wpis edukacji usunięty.');
    }

public function create()
{
    return Inertia::render('education/add-education', [
        'educationLevels' => EducationsDegreeEnum::selectOptions(),
    ]);
}
public function edit($id)
{
    $user = request()->user();
    $education = $this->service->findEducation((int)$id);
    if (! $education || $education->user_id !== $user->id) {
        return redirect()->route('employee.education')->with('error', 'Nie znaleziono wpisu lub brak uprawnień.');
    }

    // Prepare education levels (enum or DB fallback)
    $educationLevels = EducationsDegreeEnum::selectOptions();
    if (empty($educationLevels) && Schema::hasTable('education_degrees')) {
        $educationLevels = DB::table('education_degrees')
            ->orderBy('id')
            ->get()
            ->map(fn($r) => ['value' => $r->id, 'label' => $r->name])
            ->toArray();
    }

    return Inertia::render('education/edit', [
        'education' => $education,
        'educationLevels' => $educationLevels,
    ]);
}

public function update(Request $request, $id)
{
    $user = $request->user();
    $education = $this->service->findEducation((int)$id);
    if (! $education || $education->user_id !== $user->id) {
        return redirect()->route('employee.education')->with('error', 'Nie znaleziono wpisu lub brak uprawnień.');
    }

    \Log::info('Education.update: incoming', [
        'id' => $id,
        'raw' => $request->all(),
        'hasFile' => $request->hasFile('diploma'),
        'method' => $request->method(),
        'content_type' => $request->header('content-type'),
    ]);

    // Normalize booleans and ongoing state before validation
    $input = $request->all();
    $input['is_current'] = $request->boolean('is_current');
    // If ongoing, ensure end_date is null so date rule won't complain
    if ($input['is_current']) {
        $input['end_date'] = null;
        $input['end_year'] = null;
    }

    $rules = [
        'school'      => 'required|string|min:2|max:255',
        'is_current'  => 'boolean',
        'address'     => 'nullable|string|max:255',
        'zip_code'    => 'nullable|regex:/^[0-9]{2}-?[0-9]{3}$/',
        'city'        => 'required|string|min:2|max:120',
        'start_date'  => 'required|date',
        'end_date'    => 'nullable|date|after_or_equal:start_date',
        'level'       => 'required|string',
        'diploma'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
    ];

    $validator = \Validator::make($input, $rules);

    if ($validator->fails()) {
        \Log::info('Education.update: validation_failed', [
            'id' => $id,
            'errors' => $validator->errors()->toArray(),
            'input_sample' => array_intersect_key($request->all(), array_flip(['school','city','start_date','end_date','level','is_current','zip_code'])),
        ]);

        return redirect()->back()->withErrors($validator)->withInput();
    }

    $validated = $validator->validated();
    $validated['is_current'] = (bool)($validated['is_current'] ?? false);

    \Log::info('Education.update: validated', ['validated' => $validated]);

    $this->service->updateEducation($user, (int)$id, $validated, $request->file('diploma'));

    if (! $request->user()->education_completed) {
        $request->user()->forceFill(['education_completed' => true])->save();
    }

    // Przy edycji przez employee tylko synchronizuj flagę completed (nie lata)
    $this->flagsService->syncUserEducationFlag($user->id);

    return redirect()->route('employee.education')->with('success', 'Edukacja zaktualizowana.');


}

}
