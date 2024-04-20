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


    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }
}

module.exports = Server;
