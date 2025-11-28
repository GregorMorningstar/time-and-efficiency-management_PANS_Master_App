<?php

namespace App\Repositories;

use App\Interfaces\ExperienceRepositoryInterface;
use App\Models\Experiences;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExperienceRepository implements ExperienceRepositoryInterface
{
    public function __construct(
    private readonly Experiences $model,
    private readonly User $userModel) {}

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function getForAuthUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model
            ->where('user_id', $userId)
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function getAllUnconfirmedExperiences(): array
    {
        $items = $this->model
            ->with('user') //  relację user
            ->whereNotNull('end_date') // pomiń rekordy bez end_date jezeli pracownik pracuje to nie potwierdzamy
            ->where(function ($q) {
                $q->whereNull('verified')
                  ->orWhere('verified', false)
                  ->orWhere('verified', 0);
            })
            ->orderByDesc('id')
            ->get()
            ->toArray();

        return $items;
    }
    public function delete(int $id): bool
    {
        $experience = $this->model->find($id);
        if ($experience) {
            return $experience->delete();
        }
        return false;
    }
    public function findById(int $id)
    {
        return $this->model->find($id);
    }
    public function findByIdWithUser(int $id): ?Experiences
    {
        return $this->model->with('user')->find($id);
    }
  public function calculateMonthsFromExperience(Experiences $exp): int
    {
        if (empty($exp->start_date) || empty($exp->end_date)) {
            return 0;
        }
        try {
            $start = Carbon::parse($exp->start_date);
            $end = Carbon::parse($exp->end_date);
            if ($end->lt($start)) {
                return 0;
            }
            return $start->diffInMonths($end);
        } catch (\Throwable $e) {
            return 0;
        }
    }

    /**
     * Nie wykonuje zapisu w DB — tylko zwraca rekord i obliczone miesiące.
     */
    public function confirmExperience(int $id): array
    {
        $exp = $this->model->with('user')->find($id);
        if (! $exp) {
            return ['experience' => null, 'months' => 0];
        }

        $months = $this->calculateMonthsFromExperience($exp);

        return [
            'experience' => $exp,
            'months' => $months,
        ];
    }
public function handleExperienceVerification(int $id): ?Experience
    {
        $experience = $this->model->find($id);
        if ($experience) {
            $experience->verified = true;
            return true;
           // return $experience->save();
        }
        return false;
    }


}
