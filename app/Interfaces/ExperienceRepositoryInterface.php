<?php

namespace App\Interfaces;

use Illuminate\Pagination\LengthAwarePaginator;

interface ExperienceRepositoryInterface
{

    public function create(array $data);
    public function getForAuthUser(int $userId, int $perPage = 15): LengthAwarePaginator;
    public function delete(int $id): bool;
    public function findById(int $id);

}
