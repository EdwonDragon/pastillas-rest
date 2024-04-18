const express = require('express');
require('dotenv').config();
const cron = require('node-cron');
const cors = require('cors');
const { dbConexion } = require('../database/config');
const { Pastillas } = require('../models');
const { sendMessage } = require('../helpers');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        this.paths = {
            pastillasPath: '/api/pastillas',
        };


        // Conexion a BD
        this.conexion();
        // Middlewares
        this.middlewares();
        // Rutas
        this.routes();

        // Iniciar cron job
        this.iniciarCronJob();


    }

    async conexion() {
        await dbConexion();
    }



    middlewares() {
        // CORS
        this.app.use(cors());
        // Lectura y parseo del body
        this.app.use(express.json());
    }

    routes() {
        this.app.use(this.paths.pastillasPath, require('../routes/pastillas'));
    }



    iniciarCronJob() {
        // Ejecutar cada minuto (* * * * *)
        cron.schedule('* * * * *', async () => {
            console.log('Verificando y enviando advertencias de pastillas...');

            // Obtener todas las pastillas
            const pastillas = await Pastillas.find({});

            // Verificar y enviar advertencias para cada pastilla
            for (const pastilla of pastillas) {
                await this.verificarYEnviarAdvertencia(pastilla);
            }
        });
    }

    async verificarYEnviarAdvertencia(pastilla) {
        const fechaHoraActual = new Date();
        const fechaHoraInicio = new Date(pastilla.fechaHoraInicio);
        const frecuenciaHoras = parseInt(pastilla.frecuenciaHoras);

        // Calcular la diferencia en horas
        const diferenciaHoras = (fechaHoraActual - fechaHoraInicio) / (1000 * 60 * 60);

        // Verificar si es necesario enviar una advertencia
        if (diferenciaHoras >= frecuenciaHoras) {
            const mensaje = `Es hora de tomar la pastilla ${pastilla.nombre}.`;
            await sendMessage(mensaje)
            // Actualizar la fechaHoraInicio para reiniciar el contador
            pastilla.fechaHoraInicio = fechaHoraActual.toISOString();
            await pastilla.save();
        }
    }



    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }
}

module.exports = Server;
