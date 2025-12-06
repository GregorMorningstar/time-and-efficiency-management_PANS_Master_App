<?php

namespace App\Services;

use App\Interfaces\UserRepositoryInterface;
use App\Services\EducationService;
use App\Services\FlagsService;
use Illuminate\Support\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Models\User;
use App\Enums\EducationsDegree;
use Inertia\Inertia;
class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly EducationService $educationService,
        private readonly FlagsService $flagsService
    )
    {
    }

    public function getAllUsersPaginate(int $perPage = 20): LengthAwarePaginator
    {
        return $this->users->paginate($perPage);
    }

    public function getAllUsers(): Collection
    {
        return $this->users->findAll();
    }

    public function getEducationLevelById(int $userId): ?string
    {
        $currentHightEducation = $this->users->getEducationLevelById($userId);
        return $currentHightEducation;
    }

    public function verifyEducation(int $educationId, int $userId)
    {
        $educationProps = $this->educationService->findEducation($educationId);

        if (! $educationProps) {
            abort(404, 'Education record not found.');
        }

        try {
            $educationProps->verified = true;
            $educationProps->verified_at = now();
            $educationProps->save();
            // Przelicz ilosc urlopu 20 czy 26 dni
            $this->updateUrlaubLimit($educationProps->user_id);

            // Po zatwierdzeniu przez moderatora - oblicz i zaktualizuj education_levels
            $this->flagsService->syncUserEducationLevel($educationProps->user_id);

            // wywołaj tylko aktualizację limitu urlopu (bez renderowania)
            $this->updateUrlaubLimit($educationProps->user_id);

            return redirect()->route('moderator.employee.index')->with('success', 'Rekord edukacji zweryfikowany.');

        } catch (\Exception $e) {
            logger()->error('UserService::verifyEducation error', ['id' => $educationId, 'message' => $e->getMessage()]);
            abort(500, 'Failed to verify education: ' . $e->getMessage());
        }
    }

    /**
     * Odrzuca weryfikację edukacji (ustawia verified = false).
     * Aktualizuje education_levels i education_completed na podstawie pozostałych zweryfikowanych edukacji.
     */
    public function rejectEducation(int $educationId)
    {
        $educationProps = $this->educationService->findEducation($educationId);

        if (! $educationProps) {
            abort(404, 'Education record not found.');
        }

        try {
            $educationProps->verified = false;
            $educationProps->verified_at = null;
            $educationProps->save();

            // wywołaj tylko aktualizację limitu urlopu (bez renderowania)
            $this->updateUrlaubLimit($educationProps->user_id);

            // Po odrzuceniu przez moderatora - przelicz education_levels (tylko zweryfikowane wpisy)
            $this->flagsService->syncUserEducationLevel($educationProps->user_id);

            // Przelicz education_completed (czy ma jakieś wpisy)
            $this->flagsService->syncUserEducationFlag($educationProps->user_id);

            return redirect()->back()->with('success', 'Rekord edukacji odrzucony.');

        } catch (\Exception $e) {
            logger()->error('UserService::rejectEducation error', ['id' => $educationId, 'message' => $e->getMessage()]);
            abort(500, 'Failed to reject education: ' . $e->getMessage());
        }
    }

    /**
     * Usuwa edukację przez moderatora.
     * Aktualizuje education_completed i education_levels po usunięciu.
     */
    public function deleteEducation(int $educationId)
    {
        $educationProps = $this->educationService->findEducation($educationId);

        if (! $educationProps) {
            abort(404, 'Education record not found.');
        }

        $userId = $educationProps->user_id;

        try {
            // Usuń plik dyplomu jeśli istnieje
            if ($educationProps->diploma_path) {
                $diplomaPath = public_path($educationProps->diploma_path);
                if (is_file($diplomaPath)) {
                    @unlink($diplomaPath);
                }
            }

            $educationProps->delete();

            // Synchronizuj flagi po usunięciu
            $this->flagsService->syncUserEducationFlag($userId);
            $this->flagsService->syncUserEducationLevel($userId);

            return redirect()->back()->with('success', 'Rekord edukacji usunięty.');

        } catch (\Exception $e) {
            logger()->error('UserService::deleteEducation error', ['id' => $educationId, 'message' => $e->getMessage()]);
            abort(500, 'Failed to delete education: ' . $e->getMessage());
        }
    }

    /**
     * Usuwa doświadczenie zawodowe przez moderatora.
     * Aktualizuje experience_completed po usunięciu.
     */
    public function deleteExperience(int $experienceId)
    {
        $experience = \App\Models\Experiences::find($experienceId);

        if (! $experience) {
            abort(404, 'Experience record not found.');
        }

        $userId = $experience->user_id;

        try {
            // Usuń plik certyfikatu jeśli istnieje
            if ($experience->work_certificate_scan_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($experience->work_certificate_scan_path);
            }

            $experience->delete();

            // Synchronizuj flagę experience_completed po usunięciu
            $this->flagsService->syncUserExperienceFlag($userId);

            return redirect()->back()->with('success', 'Rekord doświadczenia usunięty.');

        } catch (\Exception $e) {
            logger()->error('UserService::deleteExperience error', ['id' => $experienceId, 'message' => $e->getMessage()]);
            abort(500, 'Failed to delete experience: ' . $e->getMessage());
        }
    }

    /**
     * Odrzuca weryfikację doświadczenia (ustawia verified = false).
     * Aktualizuje experience_completed po odrzuceniu.
     */
    public function rejectExperience(int $experienceId)
    {
        $experience = \App\Models\Experiences::find($experienceId);

        if (! $experience) {
            abort(404, 'Experience record not found.');
        }

        try {
            $experience->verified = false;
            $experience->save();

            // Synchronizuj flagę experience_completed po odrzuceniu
            $this->flagsService->syncUserExperienceFlag($experience->user_id);

            return redirect()->back()->with('success', 'Rekord doświadczenia odrzucony.');

        } catch (\Exception $e) {
            logger()->error('UserService::rejectExperience error', ['id' => $experienceId, 'message' => $e->getMessage()]);
            abort(500, 'Failed to reject experience: ' . $e->getMessage());
        }
    }

    public function findByIdForUser(int $id, ?User $user = null): ?User
    {
        if ($user && $user->id === $id) {
            return $user;
        }
        return $this->users->find($id);
    }
    public function handleExperienceVerification(User $user, int $months): ?User
    {
        if (! $user) {
            return null;
        }

        $success = $this->users->addExperienceMonthsToUser($user->id, $months);
        if ($success) {
            return $this->findByIdForUser($user->id, $user);
        }
        return null;}

        public function addMonthsToUserExperience(User $user, int $months)
    {
        if (! $user) {
            return false;
        }
        $userMonths = (int) $user->experience_months;
        $user->experience_months = $userMonths + $months;
return $user->save();
}

    // nowa metoda - tylko aktualizacja bez renderowania
    protected function updateUrlaubLimit(int $userId): void
    {
        $user = $this->users->find($userId);
        if (! $user) {
            return;
        }

        $experience_months = (int) $user->experience_months;
        $education_levels = ((int) $user->education_levels) * 12;
        $totalVacationSeniority = $experience_months + $education_levels;

        $user->annual_leave_entitlement = $totalVacationSeniority > 120 ? 26 : 20;
        $user->save();
    }

    /**
     * Wylicza limit urlopu na podstawie stażu pracy i poziomu wykształcenia.
     * Zwraca widok z danymi użytkownika.
     */
    public function urlaubCheckLimit(int $id)
    {
        $user = $this->users->find($id);
        if (! $user) {
            abort(404, 'User not found.');
        }

        // aktualizuj limit przed wyświetleniem
        $this->updateUrlaubLimit($id);
        $user->refresh();

        return Inertia::render('moderator/employee/urlaub/index', [
            'user' => $user,
        ]);
    }
}
