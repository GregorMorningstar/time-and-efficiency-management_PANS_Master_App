<?php

namespace App\Repositories;

use App\Interfaces\ExperienceRepositoryInterface;
use App\Models\Experiences;
use Illuminate\Pagination\LengthAwarePaginator;

class ExperienceRepository implements ExperienceRepositoryInterface
{
    public function __construct(private readonly Experiences $model) {}

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function getForAuthUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model
            ->where('user_id', $userId)
            ->orderByDesc('end_date')
            ->paginate($perPage);
    }
    public function delete(int $id): bool
    {
        $experience = $this->model->find($id);
        if ($experience) {
            return $experience->delete();
        }
        return false;
    }
    public function findById(int $id)
    {
        return $this->model->find($id);
    }
    

}
