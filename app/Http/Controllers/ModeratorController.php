<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\UserService;
use App\Services\EducationService;
use App\Services\ExperienceService;
class ModeratorController extends Controller
{



    public function __construct(
        private readonly UserService $userService,
        private readonly EducationService $educationService,
        private readonly ExperienceService $experienceService)
    {
    }
public function index()
{


return Inertia::render('moderator/index', [
]);
}
public function employeeIndex()
{


    return Inertia::render('moderator/employee/index', [
    ]);
}
public function checkEducation()
{

    $education = $this->educationService->getAllUserWithNoCheckEducation();
  //  dd($check);
    return Inertia::render('moderator/employee/check-education', [
        'education' => $education,
    ]);
}
public function lookExperienceById(int $id)
{
    $education = $this->educationService->findEducation($id);
    if (!$education) {
        abort(404, 'Education record not found.');
    }
return $education;
}
public function verifyEducation(int $educationId)
{

   return $this->userService->verifyEducation($educationId);
}
public function checkCareer()
{ $allUncheckedExperiences = $this->experienceService->getAllUnconfirmedExperiences();

    return Inertia::render('moderator/employee/check-career', [
        'experiences' => $allUncheckedExperiences,
    ]);
}

public function verifyExperience(int $experienceId)
{

   return $this->experienceService->confirmExperience($experienceId);
}
}
