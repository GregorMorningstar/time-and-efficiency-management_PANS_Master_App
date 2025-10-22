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
}
