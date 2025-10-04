<?php

namespace App\Interfaces;

use Illuminate\Pagination\LengthAwarePaginator;

interface ExperienceRepositoryInterface
{

    public function create(array $data);
    public function getForUserOrderedByEndDatePaginated(int $userId, int $perPage = 15): LengthAwarePaginator;


}
