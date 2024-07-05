<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Support\Facades\DB;
use App\Models\RegForm;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // Define validation rules
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:regforms',
            'username' => 'required|string|max:255|unique:regforms',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'required|string|max:10',
            'dob' => 'required|date',
            'address' => 'required|string|max:255',
            'gender' => 'required|string',
            'country' => 'required|string',
            'state' => 'required|string',
            'hobbies' => 'array',
            'fileToUpload' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Return validation errors if fails
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        // Handle file upload
        $image_url = null;
        if ($request->hasFile('fileToUpload')) {
            $file = $request->file('fileToUpload');
            $imageName = time().'.'.$file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $imageName);
            $image_url = $imageName;
        }

        // Insert user data into 'regforms' table
        DB::table('regforms')->insert([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'username' => $request->input('username'),
            'password' => Hash::make($request->input('password')),
            'phone' => $request->input('phone'),
            'dob' => $request->input('dob'),
            'address' => $request->input('address'),
            'gender' => $request->input('gender'),
            'country' => $request->input('country'),
            'state' => $request->input('state'),
            'hobbies' => implode(',', $request->input('hobbies', [])),
            'image_url' => $image_url,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'User registered successfully'], 201);
    }

    /**
     * Authenticate a user and return the token if successful.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // Validate email and password fields
        $validator = Validator::make($request->only('email', 'password'), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Return validation errors if fails
        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Retrieve user by email using Eloquent model
        $user = RegForm::where('email', $request->email)->first();

        // Check if user exists
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Check if password matches
        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Generate JWT token
        try {
            $token = JWTAuth::fromUser($user);
            $tokenExpiry = JWTAuth::factory()->getTTL() * 60;
            
            return response()->json([
                'token' => $token,
                'tokenExpiry' => $tokenExpiry,
            ]);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }
    }

    /**
     * Invalidate the user's token (logout).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $token = $request->bearerToken();

        try {
            auth()->setToken($token)->invalidate();
            return response()->json(['message' => 'Successfully logged out']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to logout, invalid token'], 401);
        }
    }

    /**
     * Refresh the JWT token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
/**
 * Refresh the JWT token.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return \Illuminate\Http\JsonResponse
 */
public function refresh(Request $request)
{
    // Assuming 'token' is passed as a query parameter or in the request body
    $token = $request->bearerToken(); // Use input() to retrieve data from request

    Log::info("Received refresh token: $token");

    try {
        $newToken = JWTAuth::setToken($token)->refresh();

        if (!$newToken) {
            return response()->json(['error' => 'Invalid refresh token'], 401);
        }

        $tokenExpiry = JWTAuth::factory()->getTTL() * 60;

        return response()->json([
            'token' => $newToken,
            'tokenExpiry' => $tokenExpiry,
        ]);
    } catch (\Exception $e) {
        Log::error("Token refresh error: {$e->getMessage()}");

        // Check if the error is due to token truncation
        if (strpos($e->getMessage(), 'String data, right truncated') !== false) {
            // Increase the length of the refresh_token column
            DB::statement("ALTER TABLE regforms MODIFY COLUMN refresh_token VARCHAR(512)");

            // Retry the token refresh
            return $this->refresh($request);
        }

        return response()->json(['error' => 'Could not refresh token'], 500);
    }
}
    

    /**
     * Update the authenticated user's password.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePassword(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        // Hash the new password
        $newPassword = Hash::make($request->input('password'));

        // Update the user's password
        $user->password = $newPassword;
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }
}
