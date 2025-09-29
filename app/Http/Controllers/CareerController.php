<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\NipService;
use Illuminate\Support\Facades\Log;

class CareerController extends Controller
{
    public function __construct(private readonly NipService $nipService) {}


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
        dd($request->all());
        \Log::info('Career.store payload', [
            'data' => $request->except('work_certificate_scan'),
            'has_file' => $request->hasFile('work_certificate_scan'),
            'file_name' => $request->file('work_certificate_scan')?->getClientOriginalName(),
            'file_size' => $request->file('work_certificate_scan')?->getSize(),
        ]);
        $request->validate([
            'company_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        // Here you would typically save the career data to the database
        // For example:
        // Auth::user()->careers()->create($request->all());

        return redirect()->route('employee.career')->with('success', 'Przebieg kariery został dodany.');
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
}
