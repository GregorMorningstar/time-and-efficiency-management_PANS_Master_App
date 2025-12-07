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
//edukacja i kariera
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
//maszyny
    public function machines() //list of machines assigned to employee  
    {
        return Inertia::render('employee/machines');
    }
//produkcja
    public function production()
    {
        return Inertia::render('employee/production');

   }
//planowanie
    public function planning()
    {
        return Inertia::render('employee/planning');
    }
}
