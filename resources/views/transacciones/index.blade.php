<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>JODAXI - Transacciones</title>
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
        .btn-warning {
            background: linear-gradient(135deg, #f7b731 0%, #d68910 100%);
            border: none;
            padding: 10px 25px;
            font-weight: 600;
            border-radius: 25px;
            transition: all 0.3s ease;
        }
        .btn-warning:hover {
            background: linear-gradient(135deg, #ffc73c 0%, #e6a010 100%);
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(247, 183, 49, 0.4);
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
            <a href="{{ route('productos.index') }}" class="btn btn-outline-light btn-sm me-2">Productos</a>
            <a href="{{ route('categorias.index') }}" class="btn btn-outline-light btn-sm">Categorías</a>
        </div>
    </div>
</nav>

<div class="container mt-4">
    <div class="card mb-4">
        <div class="card-header">
            <h3 class="fw-bold">🔄 Gestión de Transacciones</h3>
        </div>
        <div class="card-body">
            <form method="GET" action="{{ route('transacciones.index') }}" class="row g-3 mb-4">
                <div class="col-md-3">
                    <select name="tipo" class="form-select">
                        <option value="">Todos los tipos</option>
                        <option value="compra" {{ request('tipo') == 'compra' ? 'selected' : '' }}>Compra</option>
                        <option value="venta" {{ request('tipo') == 'venta' ? 'selected' : '' }}>Venta</option>
                        <option value="donacion" {{ request('tipo') == 'donacion' ? 'selected' : '' }}>Donación</option>
                        <option value="intercambio" {{ request('tipo') == 'intercambio' ? 'selected' : '' }}>Intercambio</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <input type="date" name="fecha_desde" class="form-control" value="{{ request('fecha_desde') }}" placeholder="Fecha desde">
                </div>
                <div class="col-md-3">
                    <input type="date" name="fecha_hasta" class="form-control" value="{{ request('fecha_hasta') }}" placeholder="Fecha hasta">
                </div>
                <div class="col-md-3">
                    <button type="submit" class="btn btn-warning w-100">
                        <i class="bi bi-funnel"></i> Filtrar
                    </button>
                </div>
            </form>

            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="fw-bold">Lista de Transacciones ({{ $transacciones->count() }})</h4>
                <a href="{{ route('transacciones.create') }}" class="btn btn-warning">
                    <i class="bi bi-plus-circle"></i> Nueva Transacción
                </a>
            </div>

            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Producto</th>
                            <th>Tipo</th>
                            <th>Monto</th>
                            <th>Comprador</th>
                            <th>Vendedor</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($transacciones as $transaccion)
                            <tr>
                                <td>{{ $transaccion->id }}</td>
                                <td>
                                    <strong>{{ $transaccion->producto?->nombre }}</strong>
                                </td>
                                <td>
                                    <span class="badge bg-{{ $transaccion->tipo == 'venta' ? 'success' : ($transaccion->tipo == 'compra' ? 'primary' : ($transaccion->tipo == 'donacion' ? 'info' : 'warning')) }}">
                                        {{ $transaccion->tipo }}
                                    </span>
                                </td>
                                <td>
                                    <span class="fw-bold text-success">${{ number_format($transaccion->monto, 2) }}</span>
                                </td>
                                <td>{{ $transaccion->comprador?->name ?: 'N/A' }}</td>
                                <td>{{ $transaccion->vendedor?->name ?: 'N/A' }}</td>
                                <td>
                                    <small class="text-muted">{{ $transaccion->created_at->format('d/m/Y H:i') }}</small>
                                </td>
                                <td>
                                    <div class="btn-group" role="group">
                                        <a href="{{ route('transacciones.show', $transaccion) }}" class="btn btn-sm btn-outline-light">
                                            <i class="bi bi-eye"></i>
                                        </a>
                                        <a href="{{ route('transacciones.edit', $transaccion) }}" class="btn btn-sm btn-warning">
                                            <i class="bi bi-pencil"></i>
                                        </a>
                                        <form action="{{ route('transacciones.destroy', $transaccion) }}" method="POST" class="d-inline">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('¿Seguro que deseas eliminar esta transacción?')">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="text-center py-4">
                                    <i class="bi bi-arrow-left-right display-4 text-muted"></i>
                                    <p class="text-muted mt-2">No se encontraron transacciones</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if($transacciones->hasPages())
                <div class="d-flex justify-content-center mt-4">
                    {{ $transacciones->links() }}
                </div>
            @endif
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
