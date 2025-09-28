<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\NipService;
use Illuminate\Support\Facades\Log;

class CareerController extends Controller
{
    public function __construct(private readonly NipService $nipService) {}

    public function create()
    {
        return Inertia::render('career/add');
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
