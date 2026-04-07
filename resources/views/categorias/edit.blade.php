<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>JODAXI - Editar Categoría</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="icon" href="https://laravel.com/favicon.ico" type="image/x-icon">
</head>
<body class="container mt-5">

    <div class="card">
        <div class="card-header">
            <h3>Editar Categoría</h3>
        </div>
        <div class="card-body">
            <form action="{{ route('categorias.update', $categoria) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="mb-3">
                    <label>Nombre de la Categoría</label>
                    <input type="text" name="nombre" class="form-control" value="{{ old('nombre', $categoria->nombre) }}" placeholder="Ej: Libros, Electrónica, Ropa..." required>
                    @error('nombre')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>

                <div class="mb-3">
                    <label>Descripción</label>
                    <textarea name="descripcion" class="form-control" rows="3">{{ old('descripcion', $categoria->descripcion) }}</textarea>
                    @error('descripcion')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>

                <button type="submit" class="btn btn-primary">Actualizar Categoría</button>
                <a href="{{ route('categorias.index') }}" class="btn btn-secondary">Cancelar</a>
            </form>
        </div>
    </div>

</body>
</html>
