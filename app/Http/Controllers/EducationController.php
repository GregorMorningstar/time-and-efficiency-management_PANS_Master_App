<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Educations;
use Illuminate\Http\Request;
use App\Enums\EducationsDegree;
use App\Services\EducationService;
use Illuminate\Support\Facades\Auth;

class EducationController extends Controller
{
    protected $service;

    public function __construct(EducationService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $educations = $this->service->paginatedFor(request()->user(), 20);
        return Inertia::render('education/education', [
            'educations'      => $educations,
            'educationLevels' => EducationsDegree::selectOptions(),
        ]);
    }

    public function addEducation()
    {
        return Inertia::render('education/add-education', [
            'educationDegrees' => EducationsDegree::selectOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'school'      => 'required|string|min:2|max:255',
            'is_current'   => 'boolean',
            'address'     => 'nullable|string|max:255',
            'zip_code'    => 'nullable|regex:/^[0-9]{2}-?[0-9]{3}$/',
            'city'        => 'required|string|min:2|max:120',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'level'       => 'required|string',
            'diploma'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
            'rodo_accept' => 'accepted',
        ]);

        $this->service->createEducation($request->user(), $validated, $request->file('diploma'));

        if (! $request->user()->education_completed) {
            $request->user()->forceFill(['education_completed' => true])->save();
        }

        return redirect()->route('employee.education')->with('success', 'Szkoła dodana.');
    }
}
