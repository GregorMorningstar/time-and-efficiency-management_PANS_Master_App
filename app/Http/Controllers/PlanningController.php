<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\FlagsService;
class PlanningController extends Controller
{


    public function __construct(private readonly FlagsService $flagsService)
    {
    }
public function index()
    {
        $user = $this->flagsService->syncUserUrlaubDaysFlag();
        dd($user);
        return Inertia::render('moderator/planning/index');
    }

}
