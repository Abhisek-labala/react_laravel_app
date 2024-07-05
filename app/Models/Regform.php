<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Auth\Authenticatable as AuthenticableTrait;
use Tymon\JWTAuth\Contracts\JWTSubject;

class RegForm extends Model implements Authenticatable, JWTSubject
{
    use AuthenticableTrait;

    protected $table = 'regforms';

    protected $fillable = [
        'id',
        'name',
        'username',
        'password',
        'email',
        'phone',
        'address',
        'gender',
        'dob',
        'country',
        'state',
        'hobbies',
        'image_url',
    ];

    // Define relationships as needed
    public function country()
    {
        return $this->belongsTo(Country::class, 'country');
    }

    public function state()
    {
        return $this->belongsTo(States::class, 'state');
    }

    // JWTSubject methods
    public function getJWTIdentifier()
    {
        return $this->getKey(); // E.g., return $this->id;
    }

    public function getJWTCustomClaims()
    {
        return []; // Optional custom claims
    }
}
