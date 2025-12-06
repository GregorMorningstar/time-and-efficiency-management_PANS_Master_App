<?php

namespace App\Services;

use App\Models\Educations;
use App\Models\User;
use App\Enums\EducationsDegree;
use Carbon\Carbon;
use App\Interfaces\EducationRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;


class EducationService
{
    /**
     * Create a new class instance.
     */
    public function __construct(private readonly EducationRepositoryInterface $educationRepository)
    {
    }
    public function create(array $data)
    {
        $education = $this->educationRepository->createEducation($data);
        $this->ensureEducationCompletedFlag($education->user_id);
        return $education;
    }
    public function createEducation(User $user, array $validated, ?UploadedFile $diploma = null): Educations
    {
        $startDate = Carbon::parse($validated['start_date']);
        $endDate   = !empty($validated['end_date']) ? Carbon::parse($validated['end_date']) : null;

        $path = null;
        if ($diploma) {
            $dir = public_path('image/dyploms');
            if (! File::exists($dir)) {
                File::makeDirectory($dir, 0755, true);
            }
            $base     = Str::slug(pathinfo($diploma->getClientOriginalName(), PATHINFO_FILENAME));
            $filename = uniqid('edu_') . '_' . $base . '.' . $diploma->getClientOriginalExtension();
            $diploma->move($dir, $filename);
            $path = 'image/dyploms/' . $filename;
        }

        $education = Educations::create([
            'user_id'         => $user->id,
            'school'          => $validated['school'],
            'address'         => $validated['address'] ?? null,
            'zip_code'        => $validated['zip_code'] ?? null,
            'city'            => $validated['city'],
            'level'           => $validated['level'],
            'start_date'      => $startDate->toDateString(),
            'end_date'        => $endDate?->toDateString(),
            'start_year'      => (int)$startDate->year,
            'end_year'        => $endDate?->year,
            'diploma_path'    => $path,
            'rodo_accepted'   => (bool)($validated['rodo_accept'] ?? false),
            'rodo_accepted_at'=> ($validated['rodo_accept'] ?? false) ? now() : null,
        ]);

        $this->ensureEducationCompletedFlag($user->id);

        return $education;
    }
    /**
     * Zwraca paginowane edukacje dla użytkownika.
     */
    public function paginatedFor(User $user, int $perPage = 15): LengthAwarePaginator
    {
        if (property_exists($this, 'educationRepository') && $this->educationRepository) {
            if (method_exists($this->educationRepository, 'paginatedFor')) {
                return $this->educationRepository->paginatedFor($user->id, $perPage);
            }
            if (method_exists($this->educationRepository, 'getForUserOrderedByEndDatePaginated')) {
                return $this->educationRepository->getForUserOrderedByEndDatePaginated($user->id, $perPage);
            }
        }

        return Educations::where('user_id', $user->id)
            ->orderByDesc('start_date')
            ->orderByDesc('end_date')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    private function ensureEducationCompletedFlag(int $userId): void
    {
        $user = User::select(['id','education_completed'])->find($userId);
        if (! $user) {
            return;
        }

        $hasAny = Educations::where('user_id', $userId)->exists();

        if ($hasAny && ! $user->education_completed) {
            $user->forceFill(['education_completed' => true])->save();
            return;
        }

        if (! $hasAny && $user->education_completed) {
            // jeśli nie ma już wpisów, ustaw flagę na false
            $user->forceFill(['education_completed' => false])->save();
            return;
        }
    }

     public function deleteEducation(int $id): bool
    {
        return $this->educationRepository->deleteEducation($id);
    }

    /**
     * Usuwa edukację dla konkretnego użytkownika i aktualizuje flagi.
     */
    public function deleteEducationForUser(int $id, int $userId): bool
    {
        $deleted = $this->educationRepository->deleteEducationForUser($id, $userId);

        if ($deleted) {
            $this->ensureEducationCompletedFlag($userId);
        }

        return $deleted;
    }

    /**
     * Zwraca najwyższy poziom edukacji w latach dla użytkownika (z zakończonych wpisów).
     */
    public function getHighestEducationYearsForUser(int $userId): int
    {
        $educations = $this->educationRepository->getAllEducationByUserId($userId);

        $completedEducations = array_filter($educations, function ($edu) {
            return empty($edu['is_current']) && !empty($edu['end_date']);
        });

        if (empty($completedEducations)) {
            return 0;
        }

        $highestYears = 0;
        foreach ($completedEducations as $edu) {
            $years = \App\Enums\EducationsDegree::yearsFor($edu['level']);
            if ($years > $highestYears) {
                $highestYears = $years;
            }
        }

        return $highestYears;
    }    public function findEducation(int $id): ?Educations
    {
        return $this->educationRepository->getEducationById($id);
    }

    /**
     * Update an existing education record for the given user.
     */
    public function updateEducation(User $user, int $id, array $validated, ?UploadedFile $diploma = null): Educations
    {
        $education = Educations::findOrFail($id);
        if ($education->user_id !== $user->id) {
            abort(403, 'Brak uprawnień do edycji tej edukacji.');
        }

        $startDate = \Carbon\Carbon::parse($validated['start_date']);
        $endDate   = !empty($validated['end_date']) ? \Carbon\Carbon::parse($validated['end_date']) : null;

        // Handle diploma file replacement if a new file provided
        if ($diploma) {
            // remove old file if exists (stored in public path)
            if (!empty($education->diploma_path)) {
                $oldPath = public_path($education->diploma_path);
                if (is_file($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $dir = public_path('image/dyploms');
            if (!\Illuminate\Support\Facades\File::exists($dir)) {
                \Illuminate\Support\Facades\File::makeDirectory($dir, 0755, true);
            }
            $base     = \Illuminate\Support\Str::slug(pathinfo($diploma->getClientOriginalName(), PATHINFO_FILENAME));
            $filename = uniqid('edu_') . '_' . $base . '.' . $diploma->getClientOriginalExtension();
            $diploma->move($dir, $filename);
            $education->diploma_path = 'image/dyploms/' . $filename;
        }

        $education->school     = $validated['school'];
        $education->address    = $validated['address'] ?? null;
        $education->zip_code   = $validated['zip_code'] ?? null;
        $education->city       = $validated['city'];
        $education->level      = $validated['level'];
        $education->start_date = $startDate->toDateString();
        $education->end_date   = $endDate?->toDateString();
        $education->start_year = (int)$startDate->year;
        $education->end_year   = $endDate?->year;

        $education->save();

        // keep the completion flag consistent
        $this->ensureEducationCompletedFlag($user->id);

        return $education;
    }


    public function getAllUserWithNoCheckEducation(): Collection
    {
        return $this->educationRepository->getUnverifiedEducations();
    }

    /**
     * Zwraca paginowane niezweryfikowane edukacje
     */
    public function getUnverifiedEducationsPaginated(int $perPage = 5): LengthAwarePaginator
    {
        return $this->educationRepository->getUnverifiedEducationsPaginated($perPage);
    }

   /**
     * Zwraca najwyższy poziom edukacji spośród zakończonych wpisów użytkownika.
     * Wynik: ['key' => string, 'years' => int, 'label' => string] lub null gdy brak.
     */
    public function highestEducationForUser(User $user): ?array
    {
     $educationsByUser = $this->educationRepository->getAllEducationByUserId($user->id);

        $completedEducations = array_filter($educationsByUser, function ($edu) {
            return empty($edu['is_current']) && !empty($edu['end_date']);
        });

        if (empty($completedEducations)) {
            return null;
        }
        $highest = array_reduce($completedEducations, function ($acc, $edu) {
            $level = $edu['level'];
            $years = EducationsDegree::EDUCATION_YEARS[$level] ?? 0;
            return $years > ($acc['years'] ?? 0) ? ['key' => $level, 'years' => $years, 'label' => EducationsDegree::tryFrom($level)->label()] : $acc;
        }, []);

        return $highest ?: null;
    }
}
