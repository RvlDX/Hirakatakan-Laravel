<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Script extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'title'];

    public function categories()
    {
        return $this->hasMany(Category::class);
    }
}
