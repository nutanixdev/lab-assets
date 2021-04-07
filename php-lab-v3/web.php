<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AjaxController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// main app route that loads the home page each time a new session is started
Route::get('/', [HomeController::class, 'index']);

// routes used by various form & method callbacks
Route::post( 'ajax/load-layout', [AjaxController::class, 'loadLayout']);
Route::post( 'ajax/load-default', [AjaxController::class, 'loadDefault']);
Route::post( 'ajax/save-to-json', [AjaxController::class, 'saveToJson']);
Route::post( 'ajax/container-info', [AjaxController::class, 'containerInfo']);
Route::post( 'ajax/pc-list-entities', [AjaxController::class, 'pcListEntities']);
