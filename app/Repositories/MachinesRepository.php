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
        return $this->machineModel->where('user_id', $userId)->get();
    }

    public function getAllMachinesPaginate() {
        return $this->machineModel->paginate(10);
    }

    public function getAllMachines()
    {
        return $this->machineModel->all();
    }
}
