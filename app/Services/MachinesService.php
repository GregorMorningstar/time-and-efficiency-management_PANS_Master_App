<?php


namespace App\Services;

use App\Repositories\MachinesRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MachinesService
{

    public function __construct(private readonly MachinesRepository $machinesRepository)
    {
    }
    /**
     * Zapisuje zdjęcie maszyny w storage/app/public/machines/
     */
    private function storeImage(UploadedFile $file): string
    {
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('machines', $filename, 'public'); // zapis w storage/app/public/machines
        return $path; // np. "machines/12345.jpg"
    }

    public function getAllMachinesByUserId($userId)
    {
        return $this->machinesRepository->getAllMachinesByUserId($userId);
    }
    public function getAllMachinesPaginate()
    {
        return $this->machinesRepository->getAllMachinesPaginate();
    }

    public function getAllMachines()
    {
        return $this->machinesRepository->getAllMachines();
    }
    public function store(array $data)
    {
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $data['image_path'] = $this->storeImage($data['image']);
            unset($data['image']);
        }

        return $this->machinesRepository->store($data);
    }

    //employee service methitod
    
}
