<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\MachinesService;
use App\Enums\MachineStatus;
use App\Services\DepartmentsService;

class MachinesController extends Controller
{


public function __construct(private readonly MachinesService $machinesService,
                            private readonly DepartmentsService $departmentsService)
    {
    }

public function index()
    {
        $userId = auth()->id();
        $machines = $this->machinesService->getAllMachinesByUserId($userId);

        return Inertia::render('machines/index', [
            'machines' => $machines,
            'machineStatuses' => MachineStatus::toArray(),
        ]);
    }


public function machineModeratorDashboard()
    {
        $allMachines = $this->machinesService->getAllMachinesPaginate();


        return Inertia::render('moderator/machines/index', [
            'machines' => $allMachines,
            'machineStatuses' => MachineStatus::toArray(),
        ]);
}
    public function addMachine()
    {

        $departments = $this->departmentsService->getAllDepartments();
       // dd($departments);
        return Inertia::render('moderator/machines/add-machines', [
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year_of_production' => 'nullable|integer|min:1800|max:' . date('Y'),
            'serial_number' => 'required|string|max:255',
            'description' => 'nullable|string',
            'working_hours' => 'nullable|integer|min:0|max:999999999',
            'max_productions_per_hour' => 'nullable|integer|min:0|max:999999',
            'department_id' => 'nullable|integer|exists:departments,id',
            'image' => 'nullable|image|mimes:jpeg,png|max:15360', // size in KB -> 15 MB
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image');
        }
//dd($validated);
        $this->machinesService->store($validated);

        return redirect()->route('moderator.machines.dashboard')
            ->with('success', 'Maszyna została dodana pomyślnie');
    }




}
