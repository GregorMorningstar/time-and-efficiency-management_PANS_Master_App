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
    public function __construct(private readonly ExperienceRepositoryInterface $repo, private readonly FlagsService $flagsService) {}

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
        $experience = $this->repo->create($data);
        $flagsExperienceCount = $this->flagsService->syncUserExperienceFlag();
        return $experience;

    }

    public function getForAuthUser(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repo->getForAuthUser($user->id, $perPage);

    }
}
