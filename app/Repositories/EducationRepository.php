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
  public function deleteEducationById(int $id): bool
    {

       // dd(12323);
        $education = Educations::find($id);
        if (! $education) {
            return false;
        }

        // optionally remove stored file if path column exists
        if (! empty($education->diploma_path) && Storage::disk('local')->exists($education->diploma_path)) {
            Storage::disk('local')->delete($education->diploma_path);
        }

        return (bool) $education->delete();
    }
    public function getEducationById(int $id): ?Educations
    {
        return $this->model->find($id);
    }

}
