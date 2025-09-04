<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class ModeratorController extends Controller
{
public function index()
{
return Inertia::render('moderator/index');
}
}
