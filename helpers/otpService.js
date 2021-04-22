const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vishwagamage808@gmail.com',
        pass: 'Sanju@1223'
    }
});

async function sendOtp(receiverEmail, next) {
    // You can follow the above approach, But we recommend you to follow the one below, as the mails will be treated as important
   const generatedOTP = otpGenerator.generate(8, {digits: true, alphabets: false, upperCase: false, specialChars: false});
    const pool = await poolPromise;
    try {
        pool.request()
            .input('_generatedOTP', sql.Int, generatedOTP)
            .execute('saveAndReturnOTP', (error, result) => {
                if (error) {
                    next(error, '');
                } else {
                    if (result.returnValue === 0) {
                        next('', result.recordset[0].otpID);
                    } else {
                        next('stored procedure return -1', '');
                    }
                }
            })
        ;
    } catch (e) {
        console.log('DB connection error!');
        next(e, '');
    }

    const mailOptions = {
        from: 'vishwagamage808@gmail.com',
        to: receiverEmail,
        subject: 'Use this OTP to verify this email with Afisolve',
        text: generatedOTP
    };

    try {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        }).then(r => console.log('then section'))
    } catch (e) {

    }

}
module.exports = {
     sendOtp
}
