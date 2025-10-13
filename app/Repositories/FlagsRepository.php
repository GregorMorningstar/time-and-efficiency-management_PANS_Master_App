<?php

namespace App\Repositories;

use App\Interfaces\FlagsRepositoryInterface;
use App\Models\User;
use App\Models\Educations;
use App\Models\Experiences;
use App\Models\AddressEmployee;
use Illuminate\Support\Facades\Auth;

class FlagsRepository implements FlagsRepositoryInterface
{

    protected $educationModel;
    protected $experienceModel;
    protected $addressModel;

    public function __construct(Educations $educationModel, Experiences $experienceModel, AddressEmployee $addressModel)
    {
        $this->educationModel = $educationModel;
        $this->experienceModel = $experienceModel;
        $this->addressModel = $addressModel;
    }

    /**
     * Synchronize education flag for a user and return current education count.
     *
     * @param int|null $userId
     * @return int  number of education records for the user after sync
     */
    public function syncUserEducationFlag(?int $userId = null): int
    {
        $userId = $userId ?? Auth::id();
        if (! $userId) {
            return 0;
        }

        $count = $this->educationModel->where('user_id', $userId)->count();

        if ($count > 0) {
             User::where('id', $userId)->update(['education_completed' => true]);
        } else {
          User::where('id', $userId)->update(['education_completed' => false]);
        }

        return $count;
    }
 /**
     * Synchronize experience flag for a user and return current experience count.
     *
     * @param int|null $userId
     * @return int  number of experience records for the user after sync
     */
    public function syncUserExperienceFlag(?int $userId = null): int
    {
        $userId = $userId ?? Auth::id();
        if (! $userId) {
            return 0;
        }

        $count = $this->experienceModel->where('user_id', $userId)->count();

        if ($count > 0) {
            User::where('id', $userId)->update(['experience_completed' => true]);
        } else {
            User::where('id', $userId)->update(['experience_completed' => false]);
        }

        return $count;
    }
 /**
     * Synchronize address flag for a user and return current address count.
     *
     * @param int|null $userId
     * @return int  number of address records for the user after sync
     */
    public function syncUserAddressFlag(?int $userId = null): int
    {
        $userId = $userId ?? Auth::id();
        if (! $userId) {
            return 0;
        }

        $count = $this->addressModel->where('user_id', $userId)->count();

        if ($count > 0) {
            User::where('id', $userId)->update(['address_completed' => true]);
        } else {
            User::where('id', $userId)->update(['address_completed' => false]);
        }

        return $count;
    }
}
