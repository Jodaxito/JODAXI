export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    estado: string;
    tipo_transaccion: 'venta' | 'donacion' | 'intercambio';
    imagen?: string;
    user_id: number;
    categoria_id?: number;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    categoria?: {
        id: number;
        nombre: string;
    };
}

export interface Categoria {
    id: number;
    nombre: string;
    descripcion?: string;
}

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    stats?: {
        productos: number;
        ventas: number;
        compras: number;
    };
}
