<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
class PlanningController extends Controller
{

public function index()
    {
        return Inertia::render('moderator/planning/index');
    }

}
