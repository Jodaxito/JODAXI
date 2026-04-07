<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>JODAXI - Editar Transacción</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="icon" href="https://laravel.com/favicon.ico" type="image/x-icon">
</head>
<body class="container mt-5">

    <div class="card">
        <div class="card-header">
            <h3>Editar Transacción</h3>
        </div>
        <div class="card-body">
            <form action="{{ route('transacciones.update', $transaccion) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="mb-3">
                    <label>Producto</label>
                    <select name="producto_id" class="form-control" required>
                        @foreach($productos as $producto)
                            <option value="{{ $producto->id }}" {{ old('producto_id', $transaccion->producto_id) == $producto->id ? 'selected' : '' }}>{{ $producto->nombre }} - ${{ number_format($producto->precio, 2) }}</option>
                        @endforeach
                    </select>
                    @error('producto_id')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>

                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label>Tipo de Transacción</label>
                        <select name="tipo" class="form-control" required>
                            <option value="compra" {{ old('tipo', $transaccion->tipo) == 'compra' ? 'selected' : '' }}>Compra</option>
                            <option value="venta" {{ old('tipo', $transaccion->tipo) == 'venta' ? 'selected' : '' }}>Venta</option>
                            <option value="donacion" {{ old('tipo', $transaccion->tipo) == 'donacion' ? 'selected' : '' }}>Donación</option>
                            <option value="intercambio" {{ old('tipo', $transaccion->tipo) == 'intercambio' ? 'selected' : '' }}>Intercambio</option>
                        </select>
                        @error('tipo')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    <div class="col-md-4 mb-3">
                        <label>Monto</label>
                        <input type="number" step="0.01" name="monto" class="form-control" value="{{ old('monto', $transaccion->monto) }}" required>
                        @error('monto')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    <div class="col-md-4 mb-3">
                        <label>Fecha</label>
                        <input type="datetime-local" name="fecha" class="form-control" value="{{ old('fecha', $transaccion->created_at->format('Y-m-d\TH:i')) }}">
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label>Comprador</label>
                        <select name="comprador_id" class="form-control">
                            <option value="">-- Seleccionar --</option>
                            @foreach($users as $user)
                                <option value="{{ $user->id }}" {{ old('comprador_id', $transaccion->comprador_id) == $user->id ? 'selected' : '' }}>{{ $user->name }}</option>
                            @endforeach
                        </select>
                        @error('comprador_id')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    <div class="col-md-6 mb-3">
                        <label>Vendedor</label>
                        <select name="vendedor_id" class="form-control">
                            <option value="">-- Seleccionar --</option>
                            @foreach($users as $user)
                                <option value="{{ $user->id }}" {{ old('vendedor_id', $transaccion->vendedor_id) == $user->id ? 'selected' : '' }}>{{ $user->name }}</option>
                            @endforeach
                        </select>
                        @error('vendedor_id')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                </div>

                <div class="mb-3">
                    <label>Notas</label>
                    <textarea name="notas" class="form-control" rows="3">{{ old('notas', $transaccion->notas) }}</textarea>
                    @error('notas')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>

                <button type="submit" class="btn btn-primary">Actualizar Transacción</button>
                <a href="{{ route('transacciones.index') }}" class="btn btn-secondary">Cancelar</a>
            </form>
        </div>
    </div>

</body>
</html>
