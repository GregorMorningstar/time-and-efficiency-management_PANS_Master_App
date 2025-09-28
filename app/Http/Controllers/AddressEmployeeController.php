<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AddressEmployeeService;

class AddressEmployeeController extends Controller
{
    protected $service;

    public function __construct(AddressEmployeeService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $addresses = $this->service->getAll();
        // ...existing code...
    }

}
