'use strict';

/*
 *
 * Copyright 2017 Softplan
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

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


    sendMail(subject, text, to) {
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
