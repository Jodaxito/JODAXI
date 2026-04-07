<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>JODAXI - Mercado Universitario</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="icon" href="https://laravel.com/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <style>
        body {
            background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
            color: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .hero-section {
            background: linear-gradient(135deg, #e50914 0%, #b20710 100%);
            color: white;
            padding: 100px 0;
            text-align: center;
            border-radius: 15px;
            margin-bottom: 50px;
            box-shadow: 0 10px 30px rgba(229, 9, 20, 0.3);
        }
        .feature-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            border-radius: 15px;
            padding: 30px;
            height: 100%;
        }
        .feature-card:hover {
            transform: translateY(-10px);
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 15px 40px rgba(229, 9, 20, 0.4);
        }
        .stats-card {
            background: linear-gradient(135deg, #141414 0%, #2a2a2a 100%);
            border-left: 4px solid #e50914;
            border-radius: 15px;
        }
        .btn-primary {
            background: linear-gradient(135deg, #e50914 0%, #b20710 100%);
            border: none;
            padding: 12px 30px;
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
            padding: 12px 30px;
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
            padding: 12px 30px;
            font-weight: 600;
            border-radius: 25px;
            transition: all 0.3s ease;
        }
        .btn-warning:hover {
            background: linear-gradient(135deg, #ffc73c 0%, #e6a010 100%);
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(247, 183, 49, 0.4);
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
        .display-4 {
            font-weight: 800;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        .lead {
            font-size: 1.5rem;
            font-weight: 300;
        }
        .text-muted {
            color: rgba(255, 255, 255, 0.7) !important;
        }
        .badge {
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: 600;
        }
        .list-unstyled li {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            border-left: 3px solid #e50914;
        }
        .container {
            max-width: 1200px;
        }
    </style>
</head>
<body class="container mt-5">

    <div class="hero-section">
        <div class="container">
            <h1 class="display-4 fw-bold">🎓 JODAXI</h1>
            <p class="lead">Mercado Universitario de Productos</p>
            <p class="mb-0 fs-5">Compra, vende, dona o intercambia productos universitarios</p>
        </div>
    </div>

    <div class="row mb-5">
        <div class="col-md-3 mb-4">
            <div class="feature-card h-100 text-center">
                <i class="bi bi-box-seam display-4 text-danger mb-3"></i>
                <h5 class="card-title fw-bold">Productos</h5>
                <p class="card-text text-muted">Gestiona tu inventario de productos universitarios</p>
                <a href="{{ route('productos.index') }}" class="btn btn-primary w-100">Ver Productos</a>
            </div>
        </div>
        <div class="col-md-3 mb-4">
            <div class="feature-card h-100 text-center">
                <i class="bi bi-tags display-4 text-success mb-3"></i>
                <h5 class="card-title fw-bold">Categorías</h5>
                <p class="card-text text-muted">Organiza tus productos por categorías</p>
                <a href="{{ route('categorias.index') }}" class="btn btn-success w-100">Ver Categorías</a>
            </div>
        </div>
        <div class="col-md-3 mb-4">
            <div class="feature-card h-100 text-center">
                <i class="bi bi-arrow-left-right display-4 text-warning mb-3"></i>
                <h5 class="card-title fw-bold">Transacciones</h5>
                <p class="card-text text-muted">Historial completo de todas tus transacciones</p>
                <a href="{{ route('transacciones.index') }}" class="btn btn-warning w-100">Ver Transacciones</a>
            </div>
        </div>
        <div class="col-md-3 mb-4">
            <div class="stats-card h-100">
                <div class="card-body">
                    <h6 class="card-subtitle mb-3 text-muted">Estadísticas Rápidas</h6>
                    <div class="row text-center">
                        <div class="col-6">
                            <small class="text-muted">Productos</small>
                            <h4 class="text-danger fw-bold">{{ App\Models\Producto::count() }}</h4>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Transacciones</small>
                            <h4 class="text-success fw-bold">0</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row mt-5">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="fw-bold">🔥 Últimas Actividades</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="fw-bold mb-4">Productos Recientes</h6>
                            <ul class="list-unstyled">
                                <li class="mb-3">
                                    <strong>Sin productos aún</strong>
                                    <small class="text-muted d-block mt-1">Crea tu primer producto</small>
                                </li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h6 class="fw-bold mb-4">Transacciones Recientes</h6>
                            <ul class="list-unstyled">
                                <li class="mb-3">
                                    <strong>Sin transacciones aún</strong>
                                    <small class="text-muted d-block mt-1">Registra tu primera transacción</small>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
