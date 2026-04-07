<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>JODAXI - Categorías</title>
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
            <a href="{{ route('transacciones.index') }}" class="btn btn-outline-light btn-sm">Transacciones</a>
        </div>
    </div>
</nav>

<div class="container mt-4">
    <div class="card">
        <div class="card-header">
            <h3 class="fw-bold">🏷️ Gestión de Categorías</h3>
        </div>
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="fw-bold">Lista de Categorías ({{ $categorias->count() }})</h4>
                <a href="{{ route('categorias.create') }}" class="btn btn-success">
                    <i class="bi bi-plus-circle"></i> Nueva Categoría
                </a>
            </div>

            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Productos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($categorias as $categoria)
                            <tr>
                                <td>{{ $categoria->id }}</td>
                                <td>
                                    <strong>{{ $categoria->nombre }}</strong>
                                </td>
                                <td>
                                    <span class="text-muted">{{ Str::limit($categoria->descripcion, 50) }}</span>
                                </td>
                                <td>
                                    <span class="badge bg-primary">{{ $categoria->productos_count ?? 0 }}</span>
                                </td>
                                <td>
                                    <div class="btn-group" role="group">
                                        <a href="{{ route('categorias.show', $categoria) }}" class="btn btn-sm btn-outline-light">
                                            <i class="bi bi-eye"></i>
                                        </a>
                                        <a href="{{ route('categorias.edit', $categoria) }}" class="btn btn-sm btn-warning">
                                            <i class="bi bi-pencil"></i>
                                        </a>
                                        <form action="{{ route('categorias.destroy', $categoria) }}" method="POST" class="d-inline">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('¿Seguro que deseas eliminar esta categoría?')">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="text-center py-4">
                                    <i class="bi bi-tags display-4 text-muted"></i>
                                    <p class="text-muted mt-2">No se encontraron categorías</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
