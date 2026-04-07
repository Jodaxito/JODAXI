<?php

namespace App\Http\Controllers;

use App\Models\Transaccion;
use App\Models\Producto;
use App\Models\User;
use Illuminate\Http\Request;

class TransaccionController extends Controller
{
    public function index()
    {
        $query = Transaccion::with(['producto', 'comprador', 'vendedor']);

        // Filtros
        if (request('tipo')) {
            $query->where('tipo', request('tipo'));
        }

        if (request('fecha_desde')) {
            $query->whereDate('created_at', '>=', request('fecha_desde'));
        }

        if (request('fecha_hasta')) {
            $query->whereDate('created_at', '<=', request('fecha_hasta'));
        }

        $transacciones = $query->latest()->paginate(10);

        return view('transacciones.index', compact('transacciones'));
    }

    public function create()
    {
        $productos = Producto::where('estado', 'disponible')->get();
        $users = User::all();
        return view('transacciones.create', compact('productos', 'users'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'comprador_id' => 'nullable|exists:users,id',
            'vendedor_id' => 'nullable|exists:users,id',
            'tipo' => 'required|in:compra,venta,donacion,intercambio',
            'monto' => 'required|numeric|min:0',
            'notas' => 'nullable|string',
        ]);

        Transaccion::create($validated);

        return redirect()->route('transacciones.index')->with('success', 'Transacción registrada correctamente');
    }

    public function show(Transaccion $transaccion)
    {
        $transaccion->load(['producto', 'comprador', 'vendedor']);
        return view('transacciones.show', compact('transaccion'));
    }

    public function edit(Transaccion $transaccion)
    {
        $productos = Producto::where('estado', 'disponible')->get();
        $users = User::all();
        return view('transacciones.edit', compact('transaccion', 'productos', 'users'));
    }

    public function update(Request $request, Transaccion $transaccion)
    {
        $validated = $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'comprador_id' => 'nullable|exists:users,id',
            'vendedor_id' => 'nullable|exists:users,id',
            'tipo' => 'required|in:compra,venta,donacion,intercambio',
            'monto' => 'required|numeric|min:0',
            'notas' => 'nullable|string',
        ]);

        $transaccion->update($validated);

        return redirect()->route('transacciones.index')->with('success', 'Transacción actualizada correctamente');
    }

    public function destroy(Transaccion $transaccion)
    {
        $transaccion->delete();

        return redirect()->route('transacciones.index')->with('success', 'Transacción eliminada correctamente');
    }
}
