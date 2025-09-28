<?php

namespace App\Services;

use App\Interfaces\AddressEmployeeRepositoryInterface;

class AddressEmployeeService
{
    protected $repo;

    public function __construct(AddressEmployeeRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function getAll()
    {
        return $this->repo->all();
    }

    public function getById($id)
    {
        return $this->repo->find($id);
    }

    public function getByUserId($userId)
    {
        return $this->repo->findByUserId($userId);
    }

    public function create(array $data)
    {
        return $this->repo->create($data);
    }

    public function update($id, array $data)
    {
        return $this->repo->update($id, $data);
    }

    public function delete($id)
    {
        return $this->repo->delete($id);
    }

    public function search(array $criteria)
    {
        return $this->repo->search($criteria);
    }
}
