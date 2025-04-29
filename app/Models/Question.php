<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = ['sub_category_id', 'character', 'reading'];

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class);
    }
}
