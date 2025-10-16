<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Enums\LeavesType;
use Illuminate\Support\Facades\Auth;
class VacationCalendarController extends Controller
{

    public function index()
    {
        // Pass enum-based select options to the Inertia page so the frontend can render type choices
        return inertia('calendar/index', ['types' => LeavesType::selectOptions()]);
    }


    public function store(Request $request)
    {
        $data = $request->all();
        $data['user_id'] = Auth::id();
        dd($data);
    }
}
