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
dd($request->all());
    }

  

   
}
