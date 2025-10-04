<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\NipService;
use App\Services\ExperienceService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Experiences;

class CareerController extends Controller
{
    public function __construct(
        private readonly NipService $nipService,
        private readonly ExperienceService $experienceService // dodaj jeśli jeszcze nie ma
    ) {}


    public function index()
    {
        return Inertia::render('career/index');
    }


    public function create()
    {
        return Inertia::render('career/add');
    }

    public function store(Request $request)
    {
        Log::info('Career.store payload', [
            'data' => $request->except('work_certificate_scan'),
            'has_file' => $request->hasFile('work_certificate_scan'),
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

        // jeśli podano NIP, spróbuj uzupełnić dane firmy przez NipService
        if (!empty($validated['nip'])) {
            try {
                $company = $this->nipService->fetchByNip((string)$validated['nip']);
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
                Log::warning('NIP lookup failed', ['nip' => $validated['nip'], 'err' => $e->getMessage()]);
                // nie przerywamy zapisu; zapisujemy ręcznie wprowadzane pola
            }
        }

        // obsługa pliku: zapis do storage/app/public/image/employment_certificate
        if ($request->hasFile('work_certificate_scan')) {
            try {
                $file = $request->file('work_certificate_scan');
                $ext = $file->getClientOriginalExtension() ?: $file->extension();
                $fileName = 'employment_cert_' . Str::random(8) . '_' . time() . '.' . $ext;
                $path = $file->storeAs('image/employment_certificate', $fileName, 'public');
                $validated['work_certificate_scan_path'] = $path;
            } catch (\Throwable $e) {
                Log::error('Failed to store work_certificate_scan', ['err' => $e->getMessage()]);
            }
        }

        $validated['user_id'] = auth()->id();

        try {
            $experience = Experiences::create($validated);
            if($experience) {

        if (! $request->user()->experience_completed) {
            $request->user()->forceFill(['experience_completed' => true])->save();
        }
}
            return redirect()->route('employee.career')->with('success', 'Przebieg kariery został dodany.');
        } catch (\Throwable $e) {
            Log::error('Experience create failed', ['err' => $e->getMessage()]);
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

    //current user's experiences paginated
    public function listExperiences()
    {
        $perPage = 15;
        $user = request()->user();
        $experiences = $this->experienceService->getCurrentUserExperiencesPaginated($user, $perPage);
        return Inertia::render('career/experienceListCurrentUser', [
            'experiences' => $experiences,
        ]);
    }
}
