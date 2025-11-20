<?php

namespace App\Interfaces;

use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\Educations;

interface EducationRepositoryInterface
{
    public function getAllEducationsByUserIdPaginated(int $userId, int $perPage): LengthAwarePaginator;
    public function createEducation(array $data): Educations;
    public function deleteEducationById(int $id): bool;
    public function getEducationById(int $id): ?Educations;
    public function getAllEducationByUserId(int $userId): array;
    public function getUnverifiedEducations(): Collection;
}
