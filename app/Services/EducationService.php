<?php

namespace App\Services;

use App\Models\Educations;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Interfaces\EducationRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class EducationService
{
    /**
     * Create a new class instance.
     */
    public function __construct(private readonly EducationRepositoryInterface $educationRepository)
    {
        //
    }


    public function paginatedFor(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return $this->educationRepository->getAllEducationsByUserIdPaginated($user->id, $perPage);
    }

    public function create(array $data)
    {
        $education = $this->educationRepository->createEducation($data);
        $this->ensureEducationCompletedFlag($education->user_id);
        return $education;
    }

    public function createEducation(User $user, array $validated, ?UploadedFile $diploma = null): Educations
    {
        $startDate = Carbon::parse($validated['start_date']);
        $endDate   = !empty($validated['end_date']) ? Carbon::parse($validated['end_date']) : null;

        $path = null;
        if ($diploma) {
            $dir = public_path('image/dyploms');
            if (! File::exists($dir)) {
                File::makeDirectory($dir, 0755, true);
            }
            $base     = Str::slug(pathinfo($diploma->getClientOriginalName(), PATHINFO_FILENAME));
            $filename = uniqid('edu_') . '_' . $base . '.' . $diploma->getClientOriginalExtension();
            $diploma->move($dir, $filename);
            $path = 'image/dyploms/' . $filename;
        }

        $education = Educations::create([
            'user_id'         => $user->id,
            'school'          => $validated['school'],
            'address'         => $validated['address'] ?? null,
            'zip_code'        => $validated['zip_code'] ?? null,
            'city'            => $validated['city'],
            'level'           => $validated['level'],
            'start_date'      => $startDate->toDateString(),
            'end_date'        => $endDate?->toDateString(),
            'start_year'      => (int)$startDate->year,
            'end_year'        => $endDate?->year,
            'diploma_path'    => $path,
            'rodo_accepted'   => (bool)($validated['rodo_accept'] ?? false),
            'rodo_accepted_at'=> ($validated['rodo_accept'] ?? false) ? now() : null,
        ]);

        $this->ensureEducationCompletedFlag($user->id);

        return $education;
    }

    private function ensureEducationCompletedFlag(int $userId): void
    {
        $user = User::select(['id','education_completed'])->find($userId);
        if (!$user || $user->education_completed) {
            return;
        }
        if (Educations::where('user_id', $userId)->exists()) {
            $user->forceFill(['education_completed' => true])->save();
        }
    }
}
