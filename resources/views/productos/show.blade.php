<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>JODAXI - Detalle del Producto</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="icon" href="https://laravel.com/favicon.ico" type="image/x-icon">
</head>
<body class="container mt-5">

    <div class="card">
        <div class="card-header">
            <h3>Detalle del Producto</h3>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <strong>Nombre:</strong> {{ $producto->nombre }}
                </div>
                <div class="col-md-6">
                    <strong>Precio:</strong> ${{ number_format($producto->precio, 2) }}
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <strong>Tipo de Transacción:</strong> 
                    <span class="badge bg-{{ $producto->tipo_transaccion == 'venta' ? 'success' : ($producto->tipo_transaccion == 'compra' ? 'primary' : ($producto->tipo_transaccion == 'donacion' ? 'info' : 'warning')) }} text-white">{{ $producto->tipo_transaccion }}</span>
                </div>
                <div class="col-md-6">
                    <strong>Estado:</strong> 
                    <span class="badge bg-{{ $producto->estado == 'disponible' ? 'success' : 'secondary' }} text-white">{{ $producto->estado }}</span>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-12">
                    <strong>Descripción:</strong><br>
                    {{ $producto->descripcion ?: 'Sin descripción' }}
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <strong>Categoría:</strong> {{ $producto->categoria?->nombre ?: 'Sin categoría' }}
                </div>
                <div class="col-md-6">
                    <strong>Publicado por:</strong> {{ $producto->user?->name }}
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <strong>Creado:</strong> {{ $producto->created_at->format('d/m/Y H:i') }}
                </div>
                <div class="col-md-6">
                    <strong>Actualizado:</strong> {{ $producto->updated_at->format('d/m/Y H:i') }}
                </div>
            </div>

            <div class="mt-4">
                <a href="{{ route('productos.edit', $producto) }}" class="btn btn-warning">Editar</a>
                <a href="{{ route('productos.index') }}" class="btn btn-secondary">Volver</a>
            </div>
        </div>
    </div>

</body>
</html>
