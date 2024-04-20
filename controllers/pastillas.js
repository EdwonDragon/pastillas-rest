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
    disponible = cantidadInsertadas === 0 ? false : true;

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



const EvaluarPastilla = async (req, res = response) => {
    const { usuario } = req.params;

    // Obtener todas las pastillas del usuario
    const pastillas = await Pastillas.find({ usuario });

    // Obtener la fecha y hora actual
    const fechaActual = moment().toISOString();

    // Filtrar las pastillas que deben ser tomadas en este momento
    const pastillasParaTomar = pastillas.filter(pastilla => {
        const fechaInicio = moment(pastilla.fechaHoraInicio);
        const frecuenciaHoras = pastilla.frecuenciaHoras;
        const diferenciaHoras = moment(fechaActual).diff(fechaInicio, 'hours');

        // Verificar si la diferencia de horas es un múltiplo de la frecuencia
        return diferenciaHoras % frecuenciaHoras === 0;
    });

    // Si hay pastillas para tomar, enviar la cadena con los IDs
    if (pastillasParaTomar.length > 0) {
        const ids = pastillasParaTomar.map(pastilla => pastilla._id).join('');
        res.status(200).json({ mensaje: `prend${ids}` });
    } else {
        res.status(200).json({ mensaje: 'noprend' });
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

        fechaHoraInicio,
        frecuenciaHoras,
        dosis
    } = req.body;

    const nombrePastilla = await Pastillas.findOne({
        nombre
    });

    // Parsear la fecha ingresada al formato ISO utilizando moment
    const fechaInicioISO = moment(fechaHoraInicio, 'DD/MM/YYYY HH:mm').toISOString();

    if (nombrePastilla) {
        res.status(400).json({
            msg: `La pastilla ${nombrePastilla.nombre} ya existe`
        })
        return
    }
    //Generar los datos a guardar
    const data = {
        nombre,
        usuario,
        cantidadInsertadas,
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

module.exports = {
    PastillasGet,
    crearPastillas,
    TomarPastilla,
    InsertarPastilla,
    BorrarPastilla,
    EvaluarPastilla
}