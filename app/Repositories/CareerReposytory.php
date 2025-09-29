<?php

namespace App\Repositories;

use App\Models\Career;
use App\Interfaces\CareerRepositoryInterface;

class CareerRepository implements CareerRepositoryInterface
{
    public function all()
    {
        return Career::with('user')->get();
    }

    public function paginateAll(int $perPage = 15)
    {
        return Career::with('user')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function find($id)
    {
        return Career::with('user')->find($id);
    }

    public function findByUserId($userId)
    {
        return Career::with('user')->where('user_id', $userId)->first();
    }

    public function paginateByUserId($userId, int $perPage = 15)
    {
        return Career::with('user')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function create(array $data)
    {
        return Career::create($data);
    }

    public function update($id, array $data)
    {
        $career = Career::findOrFail($id);
        $career->update($data);
        return $career;
    }

    public function delete($id)
    {
        return Career::destroy($id);
    }

    public function search(array $criteria)
    {
        $query = Career::with('user');
        foreach ($criteria as $key => $value) {
            $query->where($key, 'like', "%$value%");
        }
        return $query->get();
    }

    public function searchPaginated(array $criteria, int $perPage = 15)
    {
        $query = Career::with('user');
        foreach ($criteria as $key => $value) {
            $query->where($key, 'like', "%$value%");
        }
        return $query->orderByDesc('created_at')->paginate($perPage);
    }
}
