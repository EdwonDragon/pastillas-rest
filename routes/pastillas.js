const { Router } = require('express');

const { PastillasGet, crearPastillas, TomarPastilla, InsertarPastilla, BorrarPastilla, EvaluarPastilla, ActualizarFechaInicio,
    BorrarPastillasPorUsuario } = require('../controllers/pastillas');



const router = Router();

router.get('/:usuario', PastillasGet);
router.post('/crear', crearPastillas);
router.post('/tomar', TomarPastilla);
router.post('/insertar', InsertarPastilla);
router.post('/actualizar', ActualizarFechaInicio);
router.delete('/borrarAll', BorrarPastillasPorUsuario);
router.delete('/borrar', BorrarPastilla);
router.get('/evaluar/:usuario', EvaluarPastilla);

module.exports = router;