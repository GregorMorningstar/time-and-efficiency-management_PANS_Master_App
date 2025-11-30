<?php

namespace App\Repositories;

use App\Models\AddressEmployee;
use App\Interfaces\AddressEmployeeRepositoryInterface;

class AddressEmployeeRepository implements AddressEmployeeRepositoryInterface
{
    public function __construct(private readonly AddressEmployee $adressModel) {}

    public function all()
    {
        return $this->adressModel->with('user')->get();
    }

    public function find($id)
    {
        return $this->adressModel->with('user')->find($id);
    }

    public function findByUserId($userId)
    {
        return $this->adressModel->with('user')->where('user_id', $userId)->first();
    }

    public function create(array $data)
    {
        return $this->adressModel->create($data);
    }

    public function update($id, array $data)
    {
        $address = $this->adressModel->findOrFail($id);
        $address->update($data);
        return $address;
    }

    public function delete($id)
    {
        $address = $this->adressModel->find($id);
        if (! $address) {
            return false;
        }
        return $address->delete();
    }

    public function search(array $criteria)
    {
        $query = $this->adressModel->with('user');
        foreach ($criteria as $key => $value) {
            $query->where($key, 'like', "%$value%");
        }
        return $query->get();
    }
}
