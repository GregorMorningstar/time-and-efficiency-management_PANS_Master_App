<?php

namespace App\Interfaces;

interface FlagsRepositoryInterface
{
    /**
     * Synchronize education flag for a user and return current education count.
     *
     * @param int|null $userId
     * @return int
     */
    public function syncUserEducationFlag(?int $userId = null): int;

    public function syncUserExperienceFlag(?int $userId = null): int;

    public function syncUserAddressFlag(?int $userId = null): int;
}


