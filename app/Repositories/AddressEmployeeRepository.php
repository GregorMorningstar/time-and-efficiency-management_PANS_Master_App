<?php

namespace App\Repositories;

use App\Models\AddressEmployee;
use App\Interfaces\AddressEmployeeRepositoryInterface;

class AddressEmployeeRepository implements AddressEmployeeRepositoryInterface
{
    public function all()
    {
        return AddressEmployee::with('user')->get();
    }

    public function find($id)
    {
        return AddressEmployee::with('user')->find($id);
    }

    public function findByUserId($userId)
    {
        return AddressEmployee::with('user')->where('user_id', $userId)->first();
    }

    public function create(array $data)
    {
        return AddressEmployee::create($data);
    }

    public function update($id, array $data)
    {
        $address = AddressEmployee::findOrFail($id);
        $address->update($data);
        return $address;
    }

    public function delete($id)
    {
        return AddressEmployee::destroy($id);
    }

    public function search(array $criteria)
    {
        $query = AddressEmployee::with('user');
        foreach ($criteria as $key => $value) {
            $query->where($key, 'like', "%$value%");
        }
        return $query->get();
    }
}
