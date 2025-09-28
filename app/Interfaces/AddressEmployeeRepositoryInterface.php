<?php

namespace App\Interfaces;

use App\Models\AddressEmployee;

interface AddressEmployeeRepositoryInterface
{
    public function all();
    public function find($id);
    public function findByUserId($userId);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
    public function search(array $criteria);
}
