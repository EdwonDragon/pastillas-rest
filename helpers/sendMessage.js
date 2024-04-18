
const client = require('twilio')(process.env.accountSid, process.env.authToken);


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