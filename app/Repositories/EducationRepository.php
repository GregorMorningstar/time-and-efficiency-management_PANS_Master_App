<?php

namespace App\Repositories;

use App\Interfaces\EducationRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
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
        $education = Educations::find($id);
        if (! $education) {
            return false;
        }

        if (! empty($education->diploma_path) && Storage::disk('local')->exists($education->diploma_path)) {
            Storage::disk('local')->delete($education->diploma_path);
        }

        return (bool) $education->delete();
    }

    public function getEducationById(int $id): ?Educations
    {
        return $this->model->find($id);
    }

    public function getAllEducationByUserId(int $userId): array
    {
        return $this->model->where('user_id', $userId)->get()->toArray();
    }

    public function getUnverifiedEducations(): Collection
    {
        return $this->model
            ->where('verified', false)
            ->with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
