<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MainController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\ExcelController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:api');
Route::post('/refresh-token', [AuthController::class, 'refresh'])->name('refresh-token');

// CRUD Operations
Route::get('/getData', [MainController::class, 'getData'])->middleware('auth:api');
Route::post('/insertData', [MainController::class, 'insertData'])->middleware('auth:api');
Route::get('/getCountries', [MainController::class, 'getCountries']);
Route::post('/getStates', [MainController::class, 'getStates']);
Route::post('/getCountries', [MainController::class, 'getCountries']);
Route::post('/updateData', [MainController::class, 'updateData'])->middleware('auth:api');
Route::delete('/deleteData/{id}', [MainController::class, 'deleteData'])->middleware('auth:api');

// Certificate Generation Routes
Route::post('/generateCertificate', [CertificateController::class, 'generate'])->middleware('auth:api');


// Excel Generation Route
Route::get('/generate-excel', [ExcelController::class, 'generateExcel'])->middleware('auth:api');
Route::post('/excelValidation', [ExcelController::class, 'excelValidation'])->middleware('auth:api');
Route::post('/upload-excel', [ExcelController::class, 'uploadExcel'])->middleware('auth:api');

