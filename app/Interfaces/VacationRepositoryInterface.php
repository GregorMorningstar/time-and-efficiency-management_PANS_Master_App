<?php


namespace App\Interfaces;

interface VacationRepositoryInterface
{
    public function getUserVacations(int $userId): array;
    public function createVacation(array $data): array;
    public function getVacationById(int $id): ?array;
}
