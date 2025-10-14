<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\NipService;
use App\Services\ExperienceService;
use App\Services\FlagsService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Experiences;

class CareerController extends Controller
{
    public function __construct(
        private readonly NipService $nipService,
        private readonly ExperienceService $experienceService,
        private readonly FlagsService $flagsService
    ) {}


    public function index()
    {
        $userCareer = $this->experienceService->getForAuthUser(request()->user(), 15);
        return Inertia::render('career/index', [
            'experiences' => $userCareer
        ]);
    }


    public function create()
    {
        return Inertia::render('career/add');
    }

    public function store(Request $request)
    {
        Log::info('Career.store: incoming request', [
            'raw'       => $request->except('work_certificate_scan'),
            'has_file'  => $request->hasFile('work_certificate_scan'),
            'user_id'   => $request->user()?->id,
            'route'     => $request->route()?->getName(),
        ]);

        $validated = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'position' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'street' => 'nullable|string|max:255',
            'zip_code' => 'nullable|string|max:10',
            'city' => 'nullable|string|max:100',
            'nip' => 'nullable|string|max:20',
            'is_current' => 'sometimes|boolean',
            'responsibilities' => 'nullable|string',
            'work_certificate_scan' => 'nullable|file|mimes:pdf,jpeg,png|max:10240',
        ]);

        Log::info('Career.store: validated data', $validated);

        if (!empty($validated['nip'])) {
            try {
                $company = $this->nipService->fetchByNip((string)$validated['nip']);
                Log::info('Career.store: NIP lookup success', ['nip' => $validated['nip'], 'company' => $company]);
                if (!empty($company['name'])) {
                    $validated['company_name'] = $company['name'];
                }
                if (!empty($company['street'])) {
                    $validated['street'] = $company['street'];
                }
                if (!empty($company['zip'])) {
                    $validated['zip_code'] = $company['zip'];
                }
                if (!empty($company['city'])) {
                    $validated['city'] = $company['city'];
                }
            } catch (\Throwable $e) {
                Log::warning('Career.store: NIP lookup failed', ['nip' => $validated['nip'], 'err' => $e->getMessage()]);
            }
        }

        if ($request->hasFile('work_certificate_scan')) {
            try {
                $file = $request->file('work_certificate_scan');
                $ext = $file->getClientOriginalExtension() ?: $file->extension();
                $fileName = 'employment_cert_' . Str::random(8) . '_' . time() . '.' . $ext;
                $path = $file->storeAs('image/employment_certificate', $fileName, 'public');
                $validated['work_certificate_scan_path'] = $path;
            } catch (\Throwable $e) {
                Log::error('Career.store: file store failed', ['err' => $e->getMessage()]);
            }
        }

        $validated['user_id'] = auth()->id();

        try {
            Log::info('Career.store: final payload to create', $validated);
            $experience = Experiences::create($validated);
            if ($experience) {
                $count = $this->flagsService->syncUserExperienceFlag($request->user()->id ?? null);
                Log::info('Career.store: created experience + sync flags', ['experience_id' => $experience->id, 'flags_experience_count' => $count]);

                if (! $request->user()->experience_completed) {
                    $request->user()->forceFill(['experience_completed' => true])->save();
                }
            }
            return redirect()->route('employee.career')->with('success', 'Przebieg kariery został dodany.');
        } catch (\Throwable $e) {
            Log::error('Career.store: exception', ['err' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return back()->with('error', 'Błąd zapisu rekordu: ' . $e->getMessage());
        }
    }

    // GET /employee/api/company/lookup?nip=XXXXXXXXXX
    public function lookup(Request $request)
    {
        $request->validate(['nip' => 'required|string']);

        try {
            $data = $this->nipService->fetchByNip($request->string('nip'));
            return response()->json($data, 200);

        } catch (\Throwable $e) {
            Log::error('NIP lookup failed', ['e' => $e->getMessage()]);
            return response()->json(['ok' => false, 'error' => 'Błąd serwera'], 200);
        }

    }

    public function listExperiences()
    {
        $perPage = 15;
        $user = request()->user();
        $experiences = $this->experienceService->getForAuthUser($user, $perPage);
        return Inertia::render('career/experienceListCurrentUser', [
            'experiences' => $experiences,
        ]);
    }

    public function destroy(Request $request)
    {

        try {


            $deleted = $this->experienceService->deleteExperience($request->input('id'));
            if ($deleted) {
                return redirect()->route('employee.career')->with('success', 'Rekord został usunięty.');
            } else {
                return response()->json(['error' => 'Nie znaleziono rekordu lub brak uprawnień.'], 404);
            }
        } catch (\Throwable $e) {
            Log::error('Experience delete failed', ['err' => $e->getMessage()]);
            return response()->json(['error' => 'Błąd usuwania rekordu: ' . $e->getMessage()], 500);
        }

    }

    public function edit($id)
    {
        $user = request()->user();
        $experience = $this->experienceService->findByIdForUser((int)$id, $user);
        if (! $experience) {
            return redirect()->route('employee.career')->with('error', 'Rekord nie istnieje lub brak uprawnień.');
        }
        return Inertia::render('career/edit', [
            'experience' => $experience,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        Log::info('Career.update: incoming', [
            'id'      => $id,
            'raw'     => $request->except('work_certificate_scan'),
            'hasFile' => $request->hasFile('work_certificate_scan'),
            'user_id' => $user?->id,
            'method'  => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'query'   => $request->query(),
        ]);

        $validated = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'position' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'street' => 'nullable|string|max:255',
            'zip_code' => 'nullable|string|max:10',
            'city' => 'nullable|string|max:100',
            'nip' => 'nullable|string|max:20',
            'is_current' => 'sometimes|boolean',
            'responsibilities' => 'nullable|string',
            'barcode' => 'nullable|string|max:50',
            'work_certificate_scan' => 'nullable|file|mimes:pdf,jpeg,png|max:10240',
        ]);

        // If NIP changed (or provided) attempt refresh of company data
        Log::info('Career.update: validated', $validated);

        if (!empty($validated['nip'])) {
            try {
                $company = $this->nipService->fetchByNip((string)$validated['nip']);
                Log::info('Career.update: NIP lookup success', ['nip' => $validated['nip'], 'company' => $company]);
                if (!empty($company['name'])) {
                    $validated['company_name'] = $company['name'];
                }
                if (!empty($company['street'])) {
                    $validated['street'] = $company['street'];
                }
                if (!empty($company['zip'])) {
                    $validated['zip_code'] = $company['zip'];
                }
                if (!empty($company['city'])) {
                    $validated['city'] = $company['city'];
                }
            } catch (\Throwable $e) {
                Log::warning('Career.update: NIP lookup failed', ['nip' => $validated['nip'] ?? null, 'err' => $e->getMessage()]);
            }
        }

        $file = $request->hasFile('work_certificate_scan') ? $request->file('work_certificate_scan') : null;

        try {
            Log::info('Career.update: pre-update payload', ['id' => $id, 'payload' => $validated]);
            $experience = $this->experienceService->updateExperience($user, (int)$id, $validated, $file);
            if (! $experience) {
                return redirect()->route('employee.career')->with('error', 'Nie znaleziono rekordu lub brak uprawnień.');
            }
            Log::info('Career.update: update success', ['id' => $experience->id]);
            return redirect()->route('employee.career')->with('success', 'Przebieg kariery został zaktualizowany.');
        } catch (\Throwable $e) {
            Log::error('Career.update: exception', ['id' => $id, 'err' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return back()->with('error', 'Błąd aktualizacji rekordu: '.$e->getMessage());
        }
    }
}
