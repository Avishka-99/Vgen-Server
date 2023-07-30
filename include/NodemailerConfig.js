var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
	service: 'gmail',
	host: 'smtp.gmail.com',
	auth: {
		user: 'vgeninc@gmail.com',
		pass: 'asqhzledyszalufo',
	},
	tls: {
		rejectUnauthorized: false,
	},
	secure: false,
});
exports.sendMail = (otp,email) => {
	var mailOptions = {
		from: 'vgeninc@gmail.com',
		to: email,
		subject: 'Verify your email',
		text: otp,
	};
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			return error;
		} else {
			return 'Email sent: ' + info.response;
		}
	});
};
