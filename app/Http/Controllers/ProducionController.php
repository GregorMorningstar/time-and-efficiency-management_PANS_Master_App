<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;



class ProducionController extends Controller
{

public function index()
    {
        return Inertia::render('moderator/production/index');
    }

}
