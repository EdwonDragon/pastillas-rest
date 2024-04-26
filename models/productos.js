const { Schema, model } = require('mongoose');

const ProductosSchema = Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
    },
    wrong: {
        type: Number,
    },
    correct: {
        type: Number,
    },
    lote: {
        type: Number,
    }

})


ProductosSchema.methods.toJSON = function () {
    const { __v, estado, ...data } = this.toObject();

    return data;
}

module.exports = model('Productos', ProductosSchema);