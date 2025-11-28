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
    public function __construct(private readonly ExperienceRepositoryInterface $repo,
     private readonly FlagsService $flagsService,
     private readonly UserService $userService) {}

    /**
     *
     * @param User $user
     * @param array $data
     * @param UploadedFile|null $file
     * @return mixed
     */
    public function createExperience(User $user, array $data, ?UploadedFile $file = null)
    {
        Log::info('ExperienceService.create:start', [
            'user_id' => $user->id,
            'incoming_keys' => array_keys($data),
        ]);
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
        try {
            $experience = $this->repo->create($data);
            $flagsExperienceCount = $this->flagsService->syncUserExperienceFlag();
            Log::info('ExperienceService.create:success', [
                'experience_id' => $experience->id,
                'flags_experience_count' => $flagsExperienceCount,
            ]);
            return $experience;
        } catch (\Throwable $e) {
            Log::error('ExperienceService.create:failed', ['err' => $e->getMessage()]);
            throw $e;
        }

    }

    public function getForAuthUser(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repo->getForAuthUser($user->id, $perPage);

    }

    public function deleteExperience(int $id): bool
    {
        $experience = $this->repo->findById($id);
        if ($experience) {
            // If there's an associated file, delete it from storage
            if ($experience->work_certificate_scan_path) {
                Storage::disk('public')->delete($experience->work_certificate_scan_path);
            }
            $deleted = $this->repo->delete($id);
            $this->flagsService->syncUserExperienceFlag();
            return $deleted;
        }
        return false;
    }

    /**
     * Fetch single experience (no user scoping) – used internally.
     */
    public function findExperience(int $id): ?Experiences
    {
        return $this->repo->findById($id);
    }

    /**
     * Fetch experience ensuring it belongs to given user.
     */
    public function findByIdForUser(int $id, User $user): ?Experiences
    {
        $exp = $this->repo->findById($id);
        if ($exp && $exp->user_id === $user->id) {
            return $exp;
        }
        return null;
    }

    /**
     * Update an experience record (scoped to owner) with optional file.
     * Handles replacing certificate file & syncing flags.
     * NOTE: barcode is only updated if provided explicitly (else preserved).
     */
    public function updateExperience(User $user, int $id, array $data, ?UploadedFile $file = null): ?Experiences
    {
        Log::info('ExperienceService.update:start', [
            'experience_id' => $id,
            'user_id' => $user->id,
            'payload_keys' => array_keys($data),
        ]);
        $experience = $this->findByIdForUser($id, $user);
        if (! $experience) {
            Log::warning('ExperienceService.update:not_found_or_forbidden', ['experience_id' => $id, 'user_id' => $user->id]);
            return null;
        }

        if ($file) {
            try {
                if ($experience->work_certificate_scan_path) {
                    Storage::disk('public')->delete($experience->work_certificate_scan_path);
                }
                $ext = $file->getClientOriginalExtension() ?: $file->extension();
                $fileName = 'employment_cert_' . Str::random(8) . '_' . time() . '.' . $ext;
                $path = $file->storeAs('image/employment_certificate', $fileName, 'public');
                $data['work_certificate_scan_path'] = $path;
            } catch (\Throwable $e) {
                Log::error('ExperienceService: file replace failed', ['err' => $e->getMessage()]);
            }
        }

        // Preserve existing barcode if not explicitly set
        if (! array_key_exists('barcode', $data)) {
            $data['barcode'] = $experience->barcode;
        }

        try {
            $experience->fill($data);
            $experience->save();
            $count = $this->flagsService->syncUserExperienceFlag();
            Log::info('ExperienceService.update:success', [
                'experience_id' => $experience->id,
                'flags_experience_count' => $count,
            ]);
            return $experience;
        } catch (\Throwable $e) {
            Log::error('ExperienceService.update:failed', ['err' => $e->getMessage()]);
            throw $e;
        }
    }
    public function getAllUnconfirmedExperiences() : array
    {
        return $this->repo->getAllUnconfirmedExperiences();
    }

    /**
     * Zwraca wynik działania: ['success' => bool, 'months' => int, 'experience' => ?Experiences]
     */
    public function confirmExperience(int $id): \Illuminate\Http\RedirectResponse
    {
        $preview = $this->repo->confirmExperience($id);

        $experience = $preview['experience'] ?? null;
        $experience ['verified'] = true;
        $experience->save();
        $user = $this->userService->addMonthsToUserExperience($experience->user, (int) ($preview['months'] ?? 0));
  return redirect()->back()->with('success', 'Doświadczenie zostało zweryfikowane.');
        }


    }


