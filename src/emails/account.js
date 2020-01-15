const sgmail = require('@sendgrid/mail');
const sendGridAPIKey = process.env.SENDGRIDAPIKEY;

sgmail.setApiKey(sendGridAPIKey);

const sendWelcomeEmail = (email, name) => {
	sgmail.send({
		to: email,
		from: 'josephalanchandlerjr@gmail.com',
		subject: 'Welcome to the Task App',
		text: `Welcome to the app, ${name}. Enjoy!!`
	});
}


const sendCancelEmail = (email, name) => {
	sgmail.send({
		to: email,
		from: 'josephalanchandlerjr@gmail.com',
		subject: 'Sorry to see you go',
		text: `You will be missed, ${name}. Is there anything we could have done to keep you onboard?`
	});
}



module.exports = {
	sendWelcomeEmail,
	sendCancelEmail
}