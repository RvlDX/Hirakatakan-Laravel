<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SelectCategoryController extends Controller
{
    public function index()
    {
        return view('selectcategory');
    }
}
