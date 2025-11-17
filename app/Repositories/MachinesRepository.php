<?php

namespace App\Repositories;

use App\Models\Machine;

class MachinesRepository
{
    public function __construct(private readonly Machine $machineModel)
    {
    }

    public function getAllMachinesByUserId($userId)
    {
        return $this->machineModel
            ->with(['department', 'faults'])
            ->withCount('faults')
            ->where('user_id', $userId)
            ->get();
    }

    public function getAllMachinesPaginate() {
        return $this->machineModel
            ->with(['department'])
            ->paginate(10);
    }

    public function getAllMachines()
    {
        return $this->machineModel->with(['department'])->get();
    }

    public function store(array $data)
    {
        return $this->machineModel->create($data);
    }
}
