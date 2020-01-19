<?php

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

Route::get( '/', 'HomeController@getIndex' );
Route::post( 'ajax/load-layout', 'AjaxController@postLoadLayout' );
Route::post( 'ajax/load-default', 'AjaxController@postLoadDefault' );
Route::post( 'ajax/save-to-json', 'AjaxController@postSaveToJson' );
Route::post( 'ajax/physical-info', 'AjaxController@postPhysicalInfo') ;
Route::post( 'ajax/vm-info', 'AjaxController@postVmInfo') ;
Route::post( 'ajax/cluster-info', 'AjaxController@postClusterInfo') ;
Route::post( 'ajax/container-info', 'AjaxController@postContainerInfo') ;
Route::post( 'ajax/pc-cluster-info', 'AjaxController@postPcClusterInfo' );
Route::post( 'ajax/pc-list-entities', 'AjaxController@postPcListEntities' );
