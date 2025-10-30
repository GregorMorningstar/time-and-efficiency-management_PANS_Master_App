<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\MachinesService;
use App\Enums\MachineStatus;

class MachinesController extends Controller
{


public function __construct(private readonly MachinesService $machinesService)
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
        $allMachines = $this->machinesService->getAllMachines();

        return Inertia::render('moderator/machines/index', [
            'machines' => $allMachines,
            'machineStatuses' => MachineStatus::toArray(),
        ]);
}
}
