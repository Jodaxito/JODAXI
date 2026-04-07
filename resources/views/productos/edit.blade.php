<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>JODAXI - Editar Producto</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="icon" href="https://laravel.com/favicon.ico" type="image/x-icon">
</head>
<body class="container mt-5">

    <div class="card">
        <div class="card-header">
            <h3>Editar Producto</h3>
        </div>
        <div class="card-body">
            <form action="{{ route('productos.update', $producto) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="mb-3">
                    <label>Nombre del Producto</label>
                    <input type="text" name="nombre" class="form-control" value="{{ old('nombre', $producto->nombre) }}" required>
                    @error('nombre')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>

                <div class="mb-3">
                    <label>Descripción</label>
                    <textarea name="descripcion" class="form-control" rows="3">{{ old('descripcion', $producto->descripcion) }}</textarea>
                    @error('descripcion')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>

                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label>Precio</label>
                        <input type="number" step="0.01" name="precio" class="form-control" value="{{ old('precio', $producto->precio) }}" required>
                        @error('precio')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    <div class="col-md-4 mb-3">
                        <label>Tipo de Transacción</label>
                        <select name="tipo_transaccion" class="form-control" required>
                            <option value="compra" {{ old('tipo_transaccion', $producto->tipo_transaccion) == 'compra' ? 'selected' : '' }}>Compra</option>
                            <option value="venta" {{ old('tipo_transaccion', $producto->tipo_transaccion) == 'venta' ? 'selected' : '' }}>Venta</option>
                            <option value="donacion" {{ old('tipo_transaccion', $producto->tipo_transaccion) == 'donacion' ? 'selected' : '' }}>Donación</option>
                            <option value="intercambio" {{ old('tipo_transaccion', $producto->tipo_transaccion) == 'intercambio' ? 'selected' : '' }}>Intercambio</option>
                        </select>
                        @error('tipo_transaccion')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    <div class="col-md-4 mb-3">
                        <label>Estado</label>
                        <select name="estado" class="form-control" required>
                            <option value="disponible" {{ old('estado', $producto->estado) == 'disponible' ? 'selected' : '' }}>Disponible</option>
                            <option value="vendido" {{ old('estado', $producto->estado) == 'vendido' ? 'selected' : '' }}>Vendido</option>
                            <option value="intercambiado" {{ old('estado', $producto->estado) == 'intercambiado' ? 'selected' : '' }}>Intercambiado</option>
                        </select>
                        @error('estado')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                </div>

                <div class="mb-3">
                    <label>Categoría</label>
                    <select name="categoria_id" class="form-control">
                        <option value="">-- Seleccionar --</option>
                        @foreach($categorias as $categoria)
                            <option value="{{ $categoria->id }}" {{ old('categoria_id', $producto->categoria_id) == $categoria->id ? 'selected' : '' }}>{{ $categoria->nombre }}</option>
                        @endforeach
                    </select>
                    @error('categoria_id')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>

                <button type="submit" class="btn btn-primary">Actualizar Producto</button>
                <a href="{{ route('productos.index') }}" class="btn btn-secondary">Cancelar</a>
            </form>
        </div>
    </div>

</body>
</html>
