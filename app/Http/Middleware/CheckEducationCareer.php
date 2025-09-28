<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CheckEducationCareer
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'employee') {
            return $next($request);
        }

        $missing = [];

        if (! $user->education_completed) {
            $missing[] = 'edukację';
        }
        if (! $user->experience_completed) {
            $missing[] = 'karierę';
        }
        if (! $user->address_completed) {
            $missing[] = 'adres';
        }

        if (! empty($missing)) {
            $list = $this->humanList($missing,'oraz');
            $msg  = 'Uzupełnij: '.$list.'.';

            Inertia::share([
                'flash' => array_merge(
                    (array) Inertia::getShared('flash'),
                    ['alertMessage' => $msg]
                ),
            ]);

            $allowedRoutes = [
                'employee.dashboard',
                'employee.education',
                'employee.education.add',
                'employee.education.store',
                'employee.career',
                'employee.address',
                'employee.address.add',
                'employee.address.store',
                'api.company.lookup',
                'employee.career.add',
                
            ];

            $currentName = $request->route()?->getName();

            if ($currentName && ! in_array($currentName, $allowedRoutes, true)) {
                return redirect()->route('employee.dashboard')->with('alertMessage',$msg);
            }
        }

        return $next($request);
    }

    private function humanList(array $items, string $conjunction = 'oraz'): string
    {
        $c = count($items);
        if ($c === 1) return $items[0];
        if ($c === 2) return $items[0] . ' ' . $conjunction . ' ' . $items[1];
        $last = array_pop($items);
        return implode(', ', $items) . ' ' . $conjunction . ' ' . $last;
    }
}
