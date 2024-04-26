const {
    response
} = require('express');
const {
    Productos
} = require('../models');


const ProductosGet = async (req, res = response) => {
    const query = {
        name: req.body.name,
        // lote: req.body.lote
    };
    const [total, producto] = await Promise.all([
        Productos.countDocuments(query),
        Productos.find(query)
    ]);

    res.status(200).json({
        total,
        producto
    })
}

const InsertarProducto = async (req, res = response) => {
    const { name, lote, correct } = req.body;

    try {
        // Busca el producto por su nombre y número de lote
        let producto = await Productos.findOne({ name, lote });

        // Si no se encuentra el producto, crea uno nuevo
        if (!producto) {
            producto = new Productos({
                name,
                lote,
                correct: correct ? 1 : 0,
                wrong: correct ? 0 : 1
            });

            await producto.save();
            return res.status(201).json({ producto });
        }

        // Incrementa el contador correcto o incorrecto según el valor de correct en el cuerpo de la solicitud
        if (correct) {
            producto.correct += 1;
        } else {
            producto.wrong += 1;
        }

        // Guarda los cambios en la base de datos
        await producto.save();

        res.status(200).json({ producto });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}



const BorrarProducto = async (req, res = response) => {
    const { name, lote } = req.body;

    try {
        // Busca el producto por su nombre y número de lote
        const producto = await Productos.findOneAndDelete({ name, lote });

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}




module.exports = {
    ProductosGet,
    InsertarProducto,
    BorrarProducto
}