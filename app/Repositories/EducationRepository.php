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

    public function deleteEducationForUser(int $id, int $userId): bool
    {
        $education = $this->model->where('id', $id)->where('user_id', $userId)->first();
        if (! $education) {
            return false;
        }

        // Usuń plik dyplomu z public/image/dyploms jeśli istnieje
        if (! empty($education->diploma_path)) {
            $fullPath = public_path($education->diploma_path);
            if (is_file($fullPath)) {
                @unlink($fullPath);
            }
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

    public function getUnverifiedEducationsPaginated(int $perPage = 5): LengthAwarePaginator
    {
        return $this->model
            ->where('verified', false)
            ->with('user:id,name,email,barcode')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getAllUnconfirmedExperiences() : array
    {
        return $this->model->where('verified', false)->get()->toArray();
    }
}
