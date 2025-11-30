<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Enums\EducationsDegree;

class EmployeeController extends Controller
{
    public function index()
    {
        return Inertia::render('employee/index');
    }

    public function addEducation()
    {
        return Inertia::render('employee/add-education', [
            'educationLevels' => EducationsDegree::selectOptions(),
        ]);
    }

    public function education()
    {
        return Inertia::render('employee/education');
    }

    public function career()
    {
        return Inertia::render('employee/career');
    }

   
}
