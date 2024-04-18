const { Router } = require('express');
// const { check } = require('express-validator');




// const { validarCapos, } = require('../middlewares');
const { PastillasGet, crearPastillas, TomarPastilla, InsertarPastilla, BorrarPastilla } = require('../controllers/pastillas');



const router = Router();

router.get('/', PastillasGet);
router.post('/crear', crearPastillas);
router.post('/tomar', TomarPastilla);
router.post('/insertar', InsertarPastilla);
router.delete('/borrar', BorrarPastilla);

module.exports = router;