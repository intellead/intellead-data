'use strict';
var nodemailer = require('nodemailer');
var administrator_mail = process.env.ADMINISTRATOR_MAIL;
var administrator_mail_password = process.env.ADMINISTRATOR_MAIL_PASSWORD;
var administrator_mail_service = process.env.ADMINISTRATOR_MAIL_SERVICE;

var transporter = nodemailer.createTransport({
    service: administrator_mail_service,
    auth: {
        user: administrator_mail,
        pass: administrator_mail_password
    }
});

var mailOptions = {
    from: administrator_mail,
    to: administrator_mail,
    subject: 'No subject',
    text: 'No text'
};

class MailService {


    sendMail(to, subject, text) {
        if (to) {
            mailOptions.to = to;
        }
        if (subject) {
            mailOptions.subject = subject;
        }
        if (text) {
            mailOptions.text = text;
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }


}
module.exports = MailService;
