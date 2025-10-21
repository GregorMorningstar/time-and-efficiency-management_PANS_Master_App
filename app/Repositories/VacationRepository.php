<?php


namespace App\Repositories;
use App\Interfaces\VacationRepositoryInterface;
use App\Models\Leaves;


class VacationRepository implements VacationRepositoryInterface
{

protected $vacationModel;

    public function __construct( Leaves $vacationModel)
    {
        $this->vacationModel = $vacationModel;
    }
    public function getUserVacations(int $userId): array
    {
       return $this->vacationModel->where('user_id', $userId)->get()->toArray();
    }
    public function createVacation(array $data): array
    {
        $vacation = $this->vacationModel->create($data);
        return $vacation->toArray();
    }
    public function getVacationById(int $id): ?array
    {
        $vacation = $this->vacationModel->find($id);
        return $vacation ? $vacation->toArray() : null;
    }
}

