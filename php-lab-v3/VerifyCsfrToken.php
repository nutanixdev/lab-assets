<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        'ajax/load-layout',
        'ajax/pc-list-entities',
        'ajax/container-info',
        'ajax/save-to-json',
        'ajax/load-default'
    ];
}