<?php

namespace App\Services;

use App\Interfaces\UserRepositoryInterface;
use App\Services\EducationService;
use Illuminate\Support\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Models\User;
use App\Enums\EducationsDegree;
class UserService
{
    public function __construct(private readonly UserRepositoryInterface $users, private readonly EducationService $educationService)
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

    public function verifyEducation(int $educationId)
    {
        $educationProps = $this->educationService->findEducation($educationId);

        if (! $educationProps) {
            abort(404, 'Education record not found.');
        }

        try {
            $educationProps->verified = true;
            $educationProps->verified_at = now();
            $educationProps->save();

            $levelKey = $educationProps->level ?? null;
            if ($levelKey instanceof \App\Enums\EducationsDegree) {
                $levelKey = $levelKey->value;
            }
            $years = EducationsDegree::yearsFor($levelKey);
            $userCurrentRaw = $this->getEducationLevelById($educationProps->user_id);
            if ($userCurrentRaw === null) {
                $userCurrentYears = 0;
            } elseif (is_numeric($userCurrentRaw)) {
                $userCurrentYears = (int) $userCurrentRaw;
            } else {
                $userCurrentYears = EducationsDegree::yearsFor((string) $userCurrentRaw);
            }

            $updated = false;

            if ($years > $userCurrentYears) {
                $user = $this->users->find($educationProps->user_id);
                if (! $user) {
                    abort(404, 'User not found.');
                }
                $user->education_levels = $years;
                $user->save();
                $updated = true;
            }

            $levelEducationByProps = $this->educationService->highestEducationForUser($user ?? User::find($educationProps->user_id));

                        return redirect()->back()->with('success', 'Rekord edukacji zweryfikowany.');


        } catch (\Exception $e) {
            logger()->error('UserService::verifyEducation error', ['id' => $educationId, 'message' => $e->getMessage()]);
            abort(500, 'Failed to verify education: ' . $e->getMessage());
        }
    }
}
