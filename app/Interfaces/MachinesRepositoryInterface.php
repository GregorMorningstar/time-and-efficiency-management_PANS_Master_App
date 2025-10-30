<?php


namespace App\Interfaces;

interface MachinesRepositoryInterface
{
 public function getAllMachinesByUserId($userId);
 public function getAllMachines();

}
