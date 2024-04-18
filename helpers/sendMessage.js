const accountSid = process.env.accountSid // El id de tu cuenta; 
const authToken = process.env.authToken // El TOKEN de tu cuenta; 
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