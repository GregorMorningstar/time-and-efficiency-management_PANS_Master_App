<?php

namespace App\Services;

use App\Interfaces\ExperienceRepositoryInterface;
use App\Models\User;
use App\Models\Experiences;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Pagination\LengthAwarePaginator;

class ExperienceService
{
    public function __construct(private readonly ExperienceRepositoryInterface $repo) {}

    /**
     *
     * @param User $user
     * @param array $data
     * @param UploadedFile|null $file
     * @return mixed
     */
    public function createExperience(User $user, array $data, ?UploadedFile $file = null)
    {
        if ($file) {
            Log::info('ExperienceService: received file', [
                'originalName' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'valid' => $file->isValid(),
            ]);

            $ext = $file->getClientOriginalExtension() ?: $file->extension();
            $fileName = 'employment_cert_' . Str::random(8) . '_' . time() . '.' . $ext;
            $path = $file->storeAs('image/employment_certificate', $fileName, 'public');

            Log::info('ExperienceService: stored file', ['path' => $path, 'url' => Storage::url($path)]);

            $data['work_certificate_scan_path'] = $path;
        } else {
            Log::info('ExperienceService: no file provided');
        }

        $data['user_id'] = $user->id;

        return $this->repo->create($data);
    }

    public function getCurrentUserExperiencesPaginated(User $user, int $perPage = 15): LengthAwarePaginator
    {
        // jeśli masz repo z paginacją, użyj go:
        if (method_exists($this->repo, 'getForUserOrderedByEndDatePaginated')) {
            return $this->repo->getForUserOrderedByEndDatePaginated($user->id, $perPage);
        }

        // fallback bez repo:
        return Experiences::where('user_id', $user->id)
            ->orderByDesc('is_current')   // obecne na górze
            ->orderByDesc('end_date')     // potem po dacie zakończenia malejąco
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
