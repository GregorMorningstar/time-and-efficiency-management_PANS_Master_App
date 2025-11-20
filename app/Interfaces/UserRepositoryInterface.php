<?php

namespace App\Interfaces;

use Illuminate\Support\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Models\User;

interface UserRepositoryInterface
{
    public function find(int $id): ?User;
    public function findAll(): Collection;
    public function paginate(int $perPage = 20): LengthAwarePaginator;
    public function getEducationLevelById(int $userId): ?string;
}
