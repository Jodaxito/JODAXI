<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>JODAXI - Productos</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="icon" href="https://laravel.com/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <style>
        body {
            background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
            color: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .navbar {
            background: rgba(229, 9, 20, 0.9);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
        }
        .card-header {
            background: rgba(255, 255, 255, 0.1);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px 15px 0 0 !important;
        }
        .btn-primary {
            background: linear-gradient(135deg, #e50914 0%, #b20710 100%);
            border: none;
            padding: 10px 25px;
            font-weight: 600;
            border-radius: 25px;
            transition: all 0.3s ease;
        }
        .btn-primary:hover {
            background: linear-gradient(135deg, #ff0a16 0%, #c30810 100%);
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(229, 9, 20, 0.4);
        }
        .btn-success {
            background: linear-gradient(135deg, #46d369 0%, #2ea043 100%);
            border: none;
            padding: 10px 25px;
            font-weight: 600;
            border-radius: 25px;
            transition: all 0.3s ease;
        }
        .btn-success:hover {
            background: linear-gradient(135deg, #56e479 0%, #3eb053 100%);
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(70, 211, 105, 0.4);
        }
        .btn-warning {
            background: linear-gradient(135deg, #f7b731 0%, #d68910 100%);
            border: none;
            padding: 8px 20px;
            font-weight: 600;
            border-radius: 20px;
            transition: all 0.3s ease;
        }
        .btn-danger {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            border: none;
            padding: 8px 20px;
            font-weight: 600;
            border-radius: 20px;
            transition: all 0.3s ease;
        }
        .form-control, .form-select {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            border-radius: 10px;
        }
        .form-control:focus, .form-select:focus {
            background: rgba(255, 255, 255, 0.15);
            border-color: #e50914;
            color: #ffffff;
            box-shadow: 0 0 0 0.25rem rgba(229, 9, 20, 0.25);
        }
        .table {
            color: #ffffff;
        }
        .table thead th {
            background: rgba(255, 255, 255, 0.1);
            border-bottom: 2px solid #e50914;
            font-weight: 600;
        }
        .table tbody tr:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        .badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
        }
        .text-muted {
            color: rgba(255, 255, 255, 0.7) !important;
        }
        .container {
            max-width: 1200px;
        }
    </style>
</head>
<body>

<nav class="navbar navbar-dark mb-4">
    <div class="container">
        <a class="navbar-brand fw-bold" href="/">🎓 JODAXI</a>
        <div class="d-flex">
            <a href="/" class="btn btn-outline-light btn-sm me-2">Inicio</a>
            <a href="{{ route('categorias.index') }}" class="btn btn-outline-light btn-sm me-2">Categorías</a>
            <a href="{{ route('transacciones.index') }}" class="btn btn-outline-light btn-sm">Transacciones</a>
        </div>
    </div>
</nav>

<div class="container mt-4">
    <div class="card mb-4">
        <div class="card-header">
            <h3 class="fw-bold">📦 Gestión de Productos</h3>
        </div>
        <div class="card-body">
            <form method="GET" action="{{ route('productos.index') }}" class="row g-3 mb-4">
                <div class="col-md-4">
                    <select name="tipo_transaccion" class="form-select">
                        <option value="">Todos los tipos</option>
                        <option value="venta" {{ request('tipo_transaccion') == 'venta' ? 'selected' : '' }}>Venta</option>
                        <option value="compra" {{ request('tipo_transaccion') == 'compra' ? 'selected' : '' }}>Compra</option>
                        <option value="donacion" {{ request('tipo_transaccion') == 'donacion' ? 'selected' : '' }}>Donación</option>
                        <option value="intercambio" {{ request('tipo_transaccion') == 'intercambio' ? 'selected' : '' }}>Intercambio</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <select name="estado" class="form-select">
                        <option value="">Todos los estados</option>
                        <option value="disponible" {{ request('estado') == 'disponible' ? 'selected' : '' }}>Disponible</option>
                        <option value="vendido" {{ request('estado') == 'vendido' ? 'selected' : '' }}>Vendido</option>
                        <option value="reservado" {{ request('estado') == 'reservado' ? 'selected' : '' }}>Reservado</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <select name="categoria_id" class="form-select">
                        <option value="">Todas las categorías</option>
                        @foreach($categorias as $categoria)
                            <option value="{{ $categoria->id }}" {{ request('categoria_id') == $categoria->id ? 'selected' : '' }}>{{ $categoria->nombre }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="col-12">
                    <button type="submit" class="btn btn-primary">
                        <i class="bi bi-funnel"></i> Filtrar
                    </button>
                    <a href="{{ route('productos.index') }}" class="btn btn-outline-light ms-2">
                        <i class="bi bi-arrow-clockwise"></i> Limpiar
                    </a>
                </div>
            </form>

            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="fw-bold">Lista de Productos ({{ $productos->count() }})</h4>
                <a href="{{ route('productos.create') }}" class="btn btn-success">
                    <i class="bi bi-plus-circle"></i> Nuevo Producto
                </a>
            </div>

            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($productos as $producto)
                            <tr>
                                <td>
                                    <strong>{{ $producto->nombre }}</strong>
                                    <br>
                                    <small class="text-muted">{{ Str::limit($producto->descripcion, 50) }}</small>
                                </td>
                                <td>
                                    <span class="fw-bold text-success">${{ number_format($producto->precio, 2) }}</span>
                                </td>
                                <td>
                                    <span class="badge bg-{{ $producto->tipo_transaccion == 'venta' ? 'success' : ($producto->tipo_transaccion == 'compra' ? 'primary' : ($producto->tipo_transaccion == 'donacion' ? 'info' : 'warning')) }}">
                                        {{ $producto->tipo_transaccion }}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge bg-{{ $producto->estado == 'disponible' ? 'success' : 'secondary' }}">
                                        {{ $producto->estado }}
                                    </span>
                                </td>
                                <td>{{ $producto->categoria?->nombre ?: 'Sin categoría' }}</td>
                                <td>
                                    <div class="btn-group" role="group">
                                        <a href="{{ route('productos.show', $producto) }}" class="btn btn-sm btn-outline-light">
                                            <i class="bi bi-eye"></i>
                                        </a>
                                        <a href="{{ route('productos.edit', $producto) }}" class="btn btn-sm btn-warning">
                                            <i class="bi bi-pencil"></i>
                                        </a>
                                        <form action="{{ route('productos.destroy', $producto) }}" method="POST" class="d-inline">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('¿Seguro que deseas eliminar este producto?')">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center py-4">
                                    <i class="bi bi-inbox display-4 text-muted"></i>
                                    <p class="text-muted mt-2">No se encontraron productos</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if($productos->hasPages())
                <div class="d-flex justify-content-center mt-4">
                    {{ $productos->links() }}
                </div>
            @endif
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
