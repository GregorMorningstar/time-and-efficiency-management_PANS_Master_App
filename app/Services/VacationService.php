<?php

namespace App\Services;

use App\Interfaces\VacationRepositoryInterface;

class VacationService
{
    protected VacationRepositoryInterface $vacationRepository;

    public function __construct(VacationRepositoryInterface $vacationRepository)
    {
        $this->vacationRepository = $vacationRepository;
    }

    public function getUserVacations(int $userId): array
    {
        return $this->vacationRepository->getUserVacations($userId);
    }
    public function createVacation(array $data): array
    {
        return $this->vacationRepository->createVacation($data);
    }
    public function getVacationById(int $id): ?array
    {
        return $this->vacationRepository->getVacationById($id);
    }
}
