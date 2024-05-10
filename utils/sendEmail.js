const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kunalbarve02@gmail.com',
      pass: process.env.GoogleAppPassword,
    },
});

exports.sendEmail = (to, subject, message) => {
    const mailOptions = {
        from: 'kunalbarve02@gmail.com',
        to: to,
        subject: subject,
        html: message
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(info);
        }
    })
}
