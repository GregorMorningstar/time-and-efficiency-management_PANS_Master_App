<?php


namespace App\Services;

use App\Models\Department;

class DepartmentsService
{


    public function __construct(private readonly Department $department)
    {
    }
    public function getAllDepartments()
    {
        return $this->department->orderBy('name')->get();
    }
}
