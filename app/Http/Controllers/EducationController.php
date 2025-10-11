<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Educations;
use App\Models\EducationsDegree;
use App\Enums\EducationsDegree as EducationsDegreeEnum;
use App\Services\EducationService;

class EducationController extends Controller
{
    protected $service;

    public function __construct(EducationService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $educations = $this->service->paginatedFor(request()->user(), 20);

        // Prefer enum-backed options; provide labels for frontend
        $educationLevels = EducationsDegreeEnum::selectOptions();

        // If enum isn't available or returns empty, try the DB table as fallback
        if (empty($educationLevels) && Schema::hasTable('education_degrees')) {
            $educationLevels = DB::table('education_degrees')
                ->orderBy('id')
                ->get()
                ->map(fn($r) => ['value' => $r->id, 'label' => $r->name])
                ->toArray();
        }

        return Inertia::render('education/education', [
            'educations'      => $educations,
            'educationLevels' => $educationLevels,
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
        $validated = $request->validate([
            'school'      => 'required|string|min:2|max:255',
            'is_current'   => 'boolean',
            'address'     => 'nullable|string|max:255',
            'zip_code'    => 'nullable|regex:/^[0-9]{2}-?[0-9]{3}$/',
            'city'        => 'required|string|min:2|max:120',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'level'       => 'required|string',
            'diploma'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
            'rodo_accept' => 'accepted',
        ]);

        $this->service->createEducation($request->user(), $validated, $request->file('diploma'));

        if (! $request->user()->education_completed) {
            $request->user()->forceFill(['education_completed' => true])->save();
        }

        return redirect()->route('employee.education')->with('success', 'Szkoła dodana.');
    }

   public function destroy(Request $request)
{

    $user = Auth::user();
    $id = (int) $request->input('id');
dd($id);
    if (! $id) {
        return response()->json(['error' => 'Brak ID wpisu do usunięcia.'], 422);
    }

    $education = Educations::where('id', $id)->where('user_id', $user->id)->first();

    if (! $education) {
        return response()->json(['error' => 'Nie znaleziono wpisu lub brak uprawnień.'], 404);
    }

    try {
        $education->delete();
        $this->service->ensureEducationCompletedFlag($user->id);
        return response()->json(['ok' => true]);
    } catch (\Throwable $e) {
        return response()->json(['error' => 'Błąd podczas usuwania wpisu.'], 500);
    }
}
public function create()
{
    // use enum (aliased as EducationsDegreeEnum) to provide select options
    return Inertia::render('education/add-education', [
        'educationLevels' => EducationsDegreeEnum::selectOptions(),
    ]);
}
}
