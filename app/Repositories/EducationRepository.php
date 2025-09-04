<?php

namespace App\Repositories;

use App\Interfaces\EducationRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\Educations;

class EducationRepository implements EducationRepositoryInterface
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        private readonly Educations $model, 
    ) {}

    public function getAllEducationsByUserIdPaginated($userId, $perPage): LengthAwarePaginator
    {
        return $this->model->where('user_id', $userId)->paginate($perPage);
    }
    public function createEducation(array $data): Educations
    {
        return $this->model->create($data);
    }


}
