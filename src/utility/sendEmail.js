const nodemailer = require('nodemailer');
require('dotenv').config()
const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendEmail = async (info, receiverEmail, body) => {

    const emailTemplate = `<!DOCTYPE html>
    <html>
    <head>
        <meta content="IE=edge" http-equiv="X-UA-Compatible" />
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <style>
            body {font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #F4F5FB;}
            .container {max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px;}
            .header, .footer {text-align: center; color: #999; font-size: 12px;}
            .content {color: #333;}
            a {color: #0078be; text-decoration: none; font-weight: 500;}
            .containerVerify {
                background-color: #fff;
                border-radius: 10px;
                  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 
                        0 10px 10px rgba(0,0,0,0.22);
                position: relative;
                overflow: hidden;
                width: 608px;
                max-width: 100%;
                min-height: 400px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Supply Chain</h2>
            </div>
            <div class="containerVerify">
                ${body}
            </div>
            <div class="footer">
                &copy; 2023 All rights reserved | Supply Chain<br>
            </div>
        </div>
    </body>
    </html>`;
    let recipients;
    // Check if receiverEmails is an array
    if (Array.isArray(receiverEmail)) {
        // Join the array of emails with a comma if it's an array
        recipients = receiverEmail.join(', ');
    } else {
        // Use the single email address as it is
        recipients = receiverEmail;
    }
    let subject = ''
    switch (info) {
        case 'CRUD':
            subject = 'Data Updated in Excel File'
            break;
        default:
            subject = 'Supply Chain'
            break;
    }


    const mailOptions = {
        from: '"Supply Chain" <' + process.env.EMAIL_USER + '>',
        to: recipients,
        subject,
        html: emailTemplate
    };

    try {

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};
module.exports = { sendEmail }