<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class NipService
{
    protected string $base = 'https://wl-api.mf.gov.pl/api/search/nip';

    public function validateNip(string $nip): bool
    {
        $clean = preg_replace('/\D+/', '', $nip);
        if (strlen($clean) !== 10) return false;
        $w = [6,5,7,2,3,4,5,6,7];
        $s = 0;
        for ($i = 0; $i < 9; $i++) $s += $w[$i] * (int) $clean[$i];
        $c = $s % 11;
        if ($c === 10) return false;
        return $c === (int) $clean[9];
    }

    public function fetchByNip(string $nip): array
    {
        $nipClean = preg_replace('/\D+/', '', $nip);
        if (! $this->validateNip($nipClean)) {
            return ['ok' => false, 'error' => 'Nieprawidłowy NIP'];
        }

        return Cache::remember("nip_lookup:{$nipClean}", now()->addHours(24), function () use ($nipClean) {
            $url = "{$this->base}/{$nipClean}?date=" . now()->toDateString();
            $res = Http::acceptJson()->timeout(10)->get($url);

            if (! $res->successful()) {
                return ['ok' => false, 'error' => "Błąd API MF ({$res->status()})"];
            }

            $json = $res->json();
            $subject = $json['result']['subject'] ?? ($json['result']['subjects'][0] ?? null);
            if (! $subject) {
                return ['ok' => false, 'error' => 'Nie znaleziono danych firmy'];
            }

            return [
                'ok' => true,
                'nip' => $subject['nip'] ?? $nipClean,
                'name' => $subject['name'] ?? $subject['companyName'] ?? null,
                'regon' => $subject['regon'] ?? null,
                'krs' => $subject['krs'] ?? null,
                'statusVat' => $subject['statusVat'] ?? null,
                'address' => $subject['workingAddress'] ?? ($subject['residenceAddress'] ?? null),
            ];
        });
    }
}
