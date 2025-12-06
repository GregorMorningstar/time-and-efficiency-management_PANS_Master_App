<?php

namespace App\Interfaces;

use App\Models\Experiences;
use Illuminate\Pagination\LengthAwarePaginator;

interface ExperienceRepositoryInterface
{

    public function create(array $data);
    public function getForAuthUser(int $userId, int $perPage = 15): LengthAwarePaginator;
    public function delete(int $id): bool;
    public function findById(int $id);
    public function findByIdWithUser(int $id): ?Experiences;
    public function getAllUnconfirmedExperiences() : array;


    /**
     * Zwraca rekord doświadczenia i obliczoną liczbę miesięcy (bez zapisu do DB).
     * ['experience' => ?Experiences, 'months' => int]
     */
    public function confirmExperience(int $id): array;

    public function pendingCertificatesPaginated(int $perPage = 5): LengthAwarePaginator;
}
