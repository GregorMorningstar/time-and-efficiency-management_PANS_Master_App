<?php


namespace App\Services;
use App\Repositories\MachinesRepository;


class MachinesService
{

    public function __construct(private readonly MachinesRepository $machinesRepository)
    {
    }

    public function getAllMachinesByUserId($userId)
    {
        return $this->machinesRepository->getAllMachinesByUserId($userId);
    }

}
