<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Categoria;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function index()
    {
        $query = Producto::with('categoria');

        // Filtros
        if (request('tipo_transaccion')) {
            $query->where('tipo_transaccion', request('tipo_transaccion'));
        }

        if (request('estado')) {
            $query->where('estado', request('estado'));
        }

        if (request('categoria_id')) {
            $query->where('categoria_id', request('categoria_id'));
        }

        $productos = $query->latest()->paginate(10);
        $categorias = Categoria::all();

        return view('productos.index', compact('productos', 'categorias'));
    }

    public function create()
    {
        $categorias = Categoria::all();
        return view('productos.create', compact('categorias'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'precio' => 'required|numeric|min:0',
            'tipo_transaccion' => 'required|in:compra,venta,donacion,intercambio',
            'estado' => 'required|in:disponible,vendido,intercambiado',
            'categoria_id' => 'nullable|exists:categorias,id',
            'user_id' => 'required|exists:users,id',
        ]);

        Producto::create($validated);

        return redirect()->route('productos.index')->with('success', 'Producto creado correctamente');
    }

    public function show(Producto $producto)
    {
        $producto->load('categoria', 'user');
        return view('productos.show', compact('producto'));
    }

    public function edit(Producto $producto)
    {
        $categorias = Categoria::all();
        return view('productos.edit', compact('producto', 'categorias'));
    }

    public function update(Request $request, Producto $producto)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'precio' => 'required|numeric|min:0',
            'tipo_transaccion' => 'required|in:compra,venta,donacion,intercambio',
            'estado' => 'required|in:disponible,vendido,intercambiado',
            'categoria_id' => 'nullable|exists:categorias,id',
            'user_id' => 'required|exists:users,id',
        ]);

        $producto->update($validated);

        return redirect()->route('productos.index')->with('success', 'Producto actualizado correctamente');
    }

    public function destroy(Producto $producto)
    {
        $producto->delete();

        return redirect()->route('productos.index')->with('success', 'Producto eliminado correctamente');
    }
}
