<?php

namespace App\Interfaces;

interface CareerRepositoryInterface
{
    public function all();
    public function paginateAll(int $perPage = 15);
    public function find($id);
    public function findByUserId($userId);
    public function paginateByUserId($userId, int $perPage = 15);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
    public function search(array $criteria);
    public function searchPaginated(array $criteria, int $perPage = 15);
}
