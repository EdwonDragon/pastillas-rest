const {
    response
} = require('express');
const {
    Pastillas
} = require('../models');
const { sendMessage } = require('../helpers');
const moment = require('moment');
//Obtener categorias paginado -total -populate
const PastillasGet = async (req, res = response) => {
    // const {
    //     limite = 5, desde = 0
    // } = req.body;
    const query = {
        usuario: req.params.usuario
    };
    console.log("peticion")
    const [total, pastilla] = await Promise.all([
        Pastillas.countDocuments(query),
        Pastillas.find(query)
    ]);

    res.status(200).json({
        total,
        pastilla
    })
}


const TomarPastilla = async (req, res = response) => {
    const {
        id
    } = req.body;

    let { dosis, cantidadInsertadas,
        cantidadTomadas, disponible, nombre } = await Pastillas.findById({
            _id: id
        });

    // Verificar si la cantidadInsertadas es 0 y enviar un mensaje de advertencia
    if (!disponible) {
        const mensaje = `La cantidad de pastillas ${nombre} es 0. Debes insertar más pastillas en el pastillero.`;

        await sendMessage(mensaje);
    }
    if (!disponible) {
        res.status(400).json({
            msg: `La pastilla ${nombre} ya no está disponible. Inserta más en el pastillero.`
        });
        return;
    }

    cantidadInsertadas -= dosis;
    cantidadTomadas += dosis;
    disponible = cantidadInsertadas <= 0 ? false : true;

    const pastilla = await Pastillas.findByIdAndUpdate(id, {
        cantidadInsertadas,
        cantidadTomadas,
        disponible
    }, {
        new: true
    });



    res.status(201).json({
        pastilla
    });
}

// Función para convertir una fecha string a milisegundos
const strtotime = (str) => {
    return new Date(str).getTime();
};

const EvaluarPastilla = async (req, res = response) => {
    const { usuario } = req.params;

    try {
        // Obtener todas las pastillas del usuario
        const pastillas = await Pastillas.find({ usuario });

        const mensajesPromesa = pastillas.map(async (pastilla) => {
            const mensaje = await verificarYEnviarAdvertencia(pastilla);
            return mensaje;
        });

        // Esperar a que todas las promesas se resuelvan
        const mensajes = await Promise.all(mensajesPromesa);

        // Filtrar los mensajes vacíos (null)
        const mensajesFiltrados = mensajes.filter(mensaje => mensaje !== null);

        // Unir todos los mensajes en una cadena
        const espacios = mensajesFiltrados.join('');

        res.status(200).json({ mensaje: `prend${espacios}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al evaluar las pastillas' });
    }
}

const verificarYEnviarAdvertencia = async (pastilla) => {
    const fechaHoraActual = new Date().getTime(); // Fecha y hora actual en milisegundos
    const fechaHoraInicio = strtotime(pastilla.fechaHoraInicio); // Convertir fecha inicio a milisegundos
    const frecuenciaHoras = parseInt(pastilla.frecuenciaHoras) * 60 * 60 * 1000; // Convertir horas a milisegundos

    // Calcular la diferencia en milisegundos
    const diferenciaMs = fechaHoraActual - fechaHoraInicio;

    // Verificar si es necesario enviar una advertencia
    if (diferenciaMs >= frecuenciaHoras) {
        const mensaje = `Es hora de tomar la pastilla ${pastilla.nombre}.`;
        await sendMessage(mensaje);

        // Actualizar la fechaHoraInicio para reiniciar el contador
        pastilla.fechaHoraInicio = new Date().toISOString();
        await pastilla.save();

        return pastilla.espacio;
    } else {
        return null;
    }
}




const InsertarPastilla = async (req, res = response) => {
    const {
        id,
        cantidadInsertadas
    } = req.body;

    const pastilla = await Pastillas.findByIdAndUpdate(id, {
        cantidadInsertadas,
        disponible: true
    }, {
        new: true
    })

    res.status(201).json({
        pastilla
    })
}


const BorrarPastilla = async (req, res = response) => {
    const {
        id
    } = req.body;

    const pastilla = await Pastillas.findByIdAndDelete(id);

    res.status(200).json({
        pastilla
    })
}

const crearPastillas = async (req, res = response) => {

    const nombre = req.body.nombre.toUpperCase();
    const {
        usuario,
        cantidadInsertadas,
        cantidadTomadas,
        espacio,
        fechaHoraInicio,
        frecuenciaHoras,
        dosis
    } = req.body;

    const nombrePastilla = await Pastillas.findOne({
        nombre,
        usuario

    });
    const espacioPastilla = await Pastillas.findOne({
        espacio,
        usuario
    });

    // Parsear la fecha ingresada al formato ISO utilizando moment
    const fechaInicioISO = moment(fechaHoraInicio, 'DD/MM/YYYY HH:mm').toISOString();

    if (nombrePastilla) {
        res.status(400).json({
            msg: `La pastilla ${nombrePastilla.nombre} ya existe`
        })
        return
    }
    if (espacio > 5 || espacio < 0) {
        res.status(400).json({
            msg: `El numero de espacios es del 1 al 5`
        })
        return
    }
    if (espacioPastilla) {
        res.status(400).json({
            msg: `El ${espacioPastilla.espacio} ya esta ocupado`
        })
        return
    }

    //Generar los datos a guardar
    const data = {
        nombre,
        usuario,
        cantidadInsertadas,
        espacio,
        cantidadTomadas,
        disponible: true,
        fechaHoraInicio: fechaInicioISO,
        frecuenciaHoras,
        dosis
    }
    const pastilla = new Pastillas(data);
    await pastilla.save();
    res.status(201).json(pastilla)
}

const ActualizarFechaInicio = async (req, res = response) => {
    const { fechaHoraInicio, id, nombre, dosis } = req.body;

    try {
        const pastilla = await Pastillas.findById(id);

        if (!pastilla) {
            return res.status(404).json({
                msg: 'Pastilla no encontrada'
            });
        }

        // Parsear la fecha ingresada al formato ISO utilizando moment
        const fechaInicioISO = moment(fechaHoraInicio, 'DD/MM/YYYY HH:mm').toISOString();

        // Actualizar los campos nombre, dosis y fechaHoraInicio si se proporcionan
        if (nombre) {
            pastilla.nombre = nombre.toUpperCase();
        }
        if (dosis) {
            pastilla.dosis = dosis;
        }
        pastilla.fechaHoraInicio = fechaInicioISO;

        await pastilla.save();

        res.json(pastilla);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error al actualizar la pastilla'
        });
    }
}


const BorrarPastillasPorUsuario = async (req, res = response) => {
    const { usuario } = req.body; // Usuario del que se desea borrar las pastillas

    try {
        const resultado = await Pastillas.deleteMany({ usuario });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({
                msg: `No se encontraron pastillas para el usuario ${usuario}`
            });
        }

        res.json({
            msg: `Todas las pastillas del usuario ${usuario} han sido borradas`
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error al borrar las pastillas'
        });
    }
}


module.exports = {
    PastillasGet,
    crearPastillas,
    TomarPastilla,
    InsertarPastilla,
    BorrarPastilla,
    EvaluarPastilla,
    ActualizarFechaInicio,
    BorrarPastillasPorUsuario
}