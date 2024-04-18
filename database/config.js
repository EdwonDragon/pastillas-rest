const mongoose=require('mongoose')

const dbConexion=async()=>{
    try {
        
        await mongoose.connect(process.env.MONGODB,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
            useCreateIndex:true,
            useFindAndModify:false
        });
        console.log('Base de datos conctada')
        
    } catch (error) {
        console.log(error)
        throw new Error('Error en la conexión')
    }
}

module.exports={
    dbConexion
}