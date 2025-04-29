<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['script_id', 'name'];

    public function script()
    {
        return $this->belongsTo(Script::class);
    }

    public function subCategories()
    {
        return $this->hasMany(SubCategory::class);
    }
}
