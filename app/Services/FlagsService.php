<?php

namespace App\Services;

use App\Interfaces\FlagsRepositoryInterface;

class FlagsService
{
    protected FlagsRepositoryInterface $flagsRepository;

    public function __construct(FlagsRepositoryInterface $flagsRepository)
    {
        $this->flagsRepository = $flagsRepository;
    }

    /**
     * Synchronize user's education flag and return count of educations.
     *
     * @param int|null $userId
     * @return int
     */
    public function syncUserEducationFlag(?int $userId = null): int
    {
        return $this->flagsRepository->syncUserEducationFlag($userId);
    }

    public function syncUserExperienceFlag(?int $userId = null): int
    {
        return $this->flagsRepository->syncUserExperienceFlag($userId);
    }

    public function syncUserAddressFlag(?int $userId = null): int
    {
        return $this->flagsRepository->syncUserAddressFlag($userId);
    }
}
