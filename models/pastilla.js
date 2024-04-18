const { Schema, model } = require('mongoose');

const PastillasSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true
    },

    usuario: {
        type: String,
        ref: 'Usuario',
        required: true

    },
    cantidadInsertadas: {
        type: Number,
        required: [true, 'La cantidad Insertadas es obligatoria'],
    },
    cantidadTomadas: {
        type: Number,
        required: [true, 'La cantidad tomadas es obligatoria'],
    },
    disponible: {
        type: Boolean,
        default: true
    },
    fechaHoraInicio: {
        type: String,
        required: [true, 'La fecha y hora son  obligatorias'],
    },
    frecuenciaHoras: {
        type: String,
        required: [true, 'La frecuencia es obligatoria'],
    },
    dosis: {
        type: Number,
        required: [true, 'La dosis es obligatoria'],
    }
})


PastillasSchema.methods.toJSON = function () {
    const { __v, estado, ...data } = this.toObject();

    return data;
}

module.exports = model('Pastillas', PastillasSchema);