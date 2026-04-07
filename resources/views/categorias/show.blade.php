<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>JODAXI - Detalle de Categoría</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="icon" href="https://laravel.com/favicon.ico" type="image/x-icon">
</head>
<body class="container mt-5">

    <div class="card">
        <div class="card-header">
            <h3>Detalle de Categoría</h3>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <strong>Nombre:</strong> {{ $categoria->nombre }}
                </div>
                <div class="col-md-6">
                    <strong>Productos:</strong> {{ $categoria->productos_count ?? 0 }}
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-12">
                    <strong>Descripción:</strong><br>
                    {{ $categoria->descripcion ?: 'Sin descripción' }}
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <strong>Creada:</strong> {{ $categoria->created_at->format('d/m/Y H:i') }}
                </div>
                <div class="col-md-6">
                    <strong>Actualizada:</strong> {{ $categoria->updated_at->format('d/m/Y H:i') }}
                </div>
            </div>

            <div class="mt-4">
                <a href="{{ route('categorias.edit', $categoria) }}" class="btn btn-warning">Editar</a>
                <a href="{{ route('categorias.index') }}" class="btn btn-secondary">Volver</a>
            </div>
        </div>
    </div>

</body>
</html>
