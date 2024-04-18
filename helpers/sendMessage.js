const accountSid = 'AC89e14c3c22f894148399c5bcb85d67a0' // El id de tu cuenta; 
const authToken = '1807e4ef99c87be8cfe72b7d738e930c' // El TOKEN de tu cuenta; 
const client = require('twilio')(accountSid, authToken);


const sendMessage = async (mensaje) => {

    try {
        const response = await client.messages.create({
            body: mensaje,
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+5212411344619'
        });

        console.log(response);

    } catch (error) {
        console.log(error);

    }
}

module.exports = sendMessage;