<?php

namespace App\Repositories;

use App\Interfaces\DepartmentsRepositoryInterface;
use App\Models\Department;

class DepartamentRepository implements DepartmentsRepositoryInterface
{

public function __construct(private readonly Department $departmentModel)
    {
    }


    public function getAllDepartments()
    {
        return $this->departmentModel->all();
    }
}
