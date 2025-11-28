<?php

namespace App\Repositories;

use App\Interfaces\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserRepository implements UserRepositoryInterface
{
    public function find(int $id): ?User
    {
        return User::find($id);
    }

    public function findAll(): Collection
    {
        return User::orderBy('name')->get();
    }

    public function paginate(int $perPage = 20): LengthAwarePaginator
    {
        return User::orderBy('name')->paginate($perPage);
    }

    public function getEducationLevelById(int $userId): ?string
    {
        $user = User::find($userId);
        return $user ? $user->education_levels : null;
    }
    public function addExperienceMonthsToUser(int $userId, int $months): bool
    {
        $user = User::find($userId);
        if (! $user) {
            return false;
        }

        $currentMonths = (int) $user->experience_months;
        $user->experience_months = $currentMonths + $months;
return $user->save();
    }
}
