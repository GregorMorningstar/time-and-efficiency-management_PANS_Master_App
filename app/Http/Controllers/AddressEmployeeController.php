<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AddressEmployeeService;
use Inertia\Inertia;

class AddressEmployeeController extends Controller
{
    protected $service;

    public function __construct(AddressEmployeeService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $address = $this->service->getEmployeeAddresses();
        return Inertia::render('employee/address/index', [
            'addresses' => $address,
        ]);
    }

    public function create()
    {
        return Inertia::render('employee/address/add-address');
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'street' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'house_number' => 'required|string|max:50',
            'apartment_number' => 'nullable|string|max:50',
            'zip_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'phone_number' => 'required|string|max:20',
            'rodo_accept' => 'required|boolean',
            'address_type' => 'required|string|max:100',
            'id_card_number' => 'nullable|string|max:50',
            'pesel' => 'nullable|string|max:20',
            'id_card_scan' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $file = $request->file('id_card_scan');

        $address = $this->service->createAddress(auth()->id(), $validatedData, $file);

        return redirect()->route('employee.address.index')->with('success', 'Address added successfully.');
    }
}
