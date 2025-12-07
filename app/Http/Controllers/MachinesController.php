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
        $baseRules = [
            'name' => 'required|string',
            'model' => 'nullable|string',
            'year_of_production' => 'nullable|numeric',
            'serial_number' => 'nullable|string',
            'description' => 'nullable|string',
            'working_hours' => 'nullable|numeric',
            'max_productions_per_hour' => 'nullable|numeric',
            'department_id' => 'required|exists:departments,id',
        ];

        $data = $request->validate($baseRules);

        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $request->validate([
                'image' => 'file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);
            $data['image_path'] = $request->file('image')->store('machines', 'public');
        }

        \App\Models\Machine::create($data);

        return redirect()->route('moderator.machines.dashboard')->with('success', 'Machine added successfully. ');
    }




}
