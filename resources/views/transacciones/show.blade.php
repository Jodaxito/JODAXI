<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>JODAXI - Detalle de Transacción</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="icon" href="https://laravel.com/favicon.ico" type="image/x-icon">
</head>
<body class="container mt-5">

    <div class="card">
        <div class="card-header">
            <h3>Detalle de Transacción</h3>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <strong>ID Transacción:</strong> {{ $transaccion->id }}
                </div>
                <div class="col-md-6">
                    <strong>Fecha:</strong> {{ $transaccion->created_at->format('d/m/Y H:i') }}
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <strong>Producto:</strong> {{ $transaccion->producto?->nombre }}
                </div>
                <div class="col-md-6">
                    <strong>Tipo:</strong> 
                    <span class="badge bg-{{ $transaccion->tipo == 'venta' ? 'success' : ($transaccion->tipo == 'compra' ? 'primary' : ($transaccion->tipo == 'donacion' ? 'info' : 'warning')) }} text-white">{{ $transaccion->tipo }}</span>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <strong>Monto:</strong> ${{ number_format($transaccion->monto, 2) }}
                </div>
                <div class="col-md-6">
                    <strong>Comprador:</strong> {{ $transaccion->comprador?->name ?: 'N/A' }}
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <strong>Vendedor:</strong> {{ $transaccion->vendedor?->name ?: 'N/A' }}
                </div>
                <div class="col-md-6">
                    <strong>Estado:</strong> 
                    <span class="badge bg-info text-white">Completada</span>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-12">
                    <strong>Notas:</strong><br>
                    {{ $transaccion->notas ?: 'Sin notas' }}
                </div>
            </div>

            <div class="mt-4">
                <a href="{{ route('transacciones.edit', $transaccion) }}" class="btn btn-warning">Editar</a>
                <a href="{{ route('transacciones.index') }}" class="btn btn-secondary">Volver</a>
            </div>
        </div>
    </div>

</body>
</html>
