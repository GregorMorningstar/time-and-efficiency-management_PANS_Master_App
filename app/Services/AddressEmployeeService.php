<?php

namespace App\Services;

use App\Interfaces\AddressEmployeeRepositoryInterface;
use App\Interfaces\UserRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class AddressEmployeeService
{
    public function __construct(
        private readonly AddressEmployeeRepositoryInterface $adressRepo,
        private readonly UserRepositoryInterface $userRepo
    ) {}

    public function getEmployeeAddresses()
    {
        // szukamy po user_id
        return $this->adressRepo->findByUserId(auth()->id());
    }

    /**
     * @param int $userId
     * @param array $data  - zwalidowane pola (bez pliku)
     * @param UploadedFile|null $file
     * @return mixed created AddressEmployee model
     */
    public function createAddress(int $userId, array $data, ?UploadedFile $file = null)
    {
        if ($file instanceof UploadedFile) {
            $dir = public_path('image/id_scan');
            if (! File::exists($dir)) {
                File::makeDirectory($dir, 0755, true);
            }

            $base = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
            $ext  = $file->getClientOriginalExtension() ?: 'bin';
            $filename = 'id_scan_' . uniqid() . '_' . $base . '.' . $ext;

            $file->move($dir, $filename);

            $data['id_card_scan'] = 'image/id_scan/' . $filename;
        }

        $data['user_id'] = $userId;

        $address = $this->adressRepo->create($data);

        $user = $this->userRepo->find($userId);
        if ($user) {
            $user->address_completed = true;
            $user->save();
        }

        return $address;
    }
}
