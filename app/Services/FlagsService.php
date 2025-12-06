<?php

namespace App\Services;

use App\Interfaces\FlagsRepositoryInterface;
use App\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\Auth;
class FlagsService
{
    protected FlagsRepositoryInterface $flagsRepository;
    protected UserRepositoryInterface $userRepository;

    public function __construct(FlagsRepositoryInterface $flagsRepository, UserRepositoryInterface $userRepository)
    {
        $this->flagsRepository = $flagsRepository;
        $this->userRepository = $userRepository;
    }

    /**
     * Synchronize user's education flag and return count of educations.
     *
     * @param int|null $userId
     * @return int
     */
    public function syncUserEducationFlag(?int $userId = null): int
    {
        return $this->flagsRepository->syncUserEducationFlag($userId);
    }

    public function syncUserExperienceFlag(?int $userId = null): int
    {
        return $this->flagsRepository->syncUserExperienceFlag($userId);
    }

    public function syncUserAddressFlag(?int $userId = null): int
    {
        return $this->flagsRepository->syncUserAddressFlag($userId);
    }

    /**
     * Synchronizuje education_levels w tabeli users na podstawie najwyższego poziomu edukacji.
     * UWAGA: Liczy tylko zweryfikowane edukacje (verified = true).
     * Zwraca liczbę lat dla najwyższego poziomu lub 0 gdy brak zweryfikowanych edukacji.
     */
    public function syncUserEducationLevel(int $userId): int
    {
        $user = \App\Models\User::find($userId);
        if (! $user) {
            return 0;
        }

        // Pobierz tylko zakończone I zweryfikowane przez moderatora edukacje
        $educations = \App\Models\Educations::where('user_id', $userId)
            ->where('verified', true)
            ->whereNotNull('end_date')
            ->where(function($q) {
                $q->where('is_current', 0)
                  ->orWhereNull('is_current');
            })
            ->get();

        if ($educations->isEmpty()) {
            $user->forceFill(['education_levels' => 0])->save();
            return 0;
        }

        // Znajdź najwyższy poziom według EDUCATION_YEARS z enuma
        $highestYears = 0;
        foreach ($educations as $edu) {
            $years = \App\Enums\EducationsDegree::yearsFor($edu->level);
            if ($years > $highestYears) {
                $highestYears = $years;
            }
        }

        $user->forceFill(['education_levels' => $highestYears])->save();
        return $highestYears;
    }

    public function syncUserUrlaubDaysFlag() {
        $user = $this->userRepository->find(Auth::id());
return $user;
    }
}
