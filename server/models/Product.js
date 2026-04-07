const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, default: 0 },
  estado: { type: String, enum: ['nuevo', 'usado'], default: 'usado' },
  tipo_transaccion: { type: String, enum: ['venta', 'donacion', 'intercambio'], required: true },
  imagen: { type: String, default: '' },
  categoria: { type: String, default: 'Otros' },
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
