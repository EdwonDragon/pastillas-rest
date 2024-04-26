const { Router } = require('express');
const { ProductosGet, InsertarProducto, BorrarProducto } = require('../controllers/productos');


const router = Router();

router.get('/', ProductosGet);
router.post('/insertar', InsertarProducto);
router.delete('/borrar', BorrarProducto);


module.exports = router;