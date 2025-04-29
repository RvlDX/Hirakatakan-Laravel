<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SelectScriptController extends Controller
{
    /**
     * Menampilkan halaman pilih skrip.
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        return view('selectscript');
    }
}
