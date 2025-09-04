<?php

namespace App\Interfaces;

use App\Models\Educations;
use Illuminate\Pagination\LengthAwarePaginator;

interface EducationRepositoryInterface
{
    public function getAllEducationsByUserIdPaginated(int $userId, int $perPage): LengthAwarePaginator;
    public function createEducation(array $data): Educations;
}
