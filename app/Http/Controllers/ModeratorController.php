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

// moderator panel
return Inertia::render('moderator/index', [
]);
}
//empayee panel
public function employeeIndex()
{

    $employees = $this->userService->getAllUsersPaginate(20);
    //dd($employees);
    return Inertia::render('moderator/employee/index', [
        'employees' => $employees,
    ]);
}
public function checkEducation(Request $request)
{
    $education = $this->educationService->getUnverifiedEducationsPaginated(5);

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
    $userId = $this->educationService->findEducation($educationId)->user_id;

   return $this->userService->verifyEducation($educationId, $userId);
}

public function rejectEducation(int $educationId)
{
    return $this->userService->rejectEducation($educationId);
}

public function deleteEducation(int $educationId)
{
    return $this->userService->deleteEducation($educationId);
}

public function checkCareer(Request $request)
{
    $experiences = $this->experienceService->getPendingCertificatesPaginated(5);

    return Inertia::render('moderator/employee/check-career', [
        'experiences' => $experiences,
    ]);
}

public function verifyExperience(int $experienceId)
{
$userID = $this->experienceService->findExperience($experienceId)->user_id;

   return $this->experienceService->confirmExperience($experienceId, $userID); ;
}

public function rejectExperience(int $experienceId)
{
    return $this->userService->rejectExperience($experienceId);
}

public function deleteExperience(int $experienceId)
{
    return $this->userService->deleteExperience($experienceId);
}
public function urlaubCheckLimit(int $id)
{

   return $this->userService->urlaubCheckLimit($id);
}
}
