const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

const {poolPromise} = require('../helpers/mssql-server-connection');
const {sql} = require('../helpers/mssql-server-connection');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'info.afisolve@gmail.com',
        pass: 'codered09'
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
                        next('stored procedure(saveAndReturnOTP) return -1', '');
                    }
                }
            })
        ;
    } catch (e) {
        console.log('DB connection error!');
        next(e, '');
    }

    const mailOptions = {
        from: 'info.afisolve@gmail.com',
        to: receiverEmail,
        subject: 'Action Required: Please Verify your e-mail for \'afi-Solve\'',
        text:'\'afi-Solve\' Complaint Management Unit,\n' +
            'Afisol (Pvt) Ltd,  \n' +
            'No.85/1/1,\n' +
            'Thimbirigasyaya Road,\n' +
            'Colombo 05, Sri Lanaka\n' +
            '\n' +
            'Dear Sir/Madam,\n' +
            'Please consider the following OTP(One Time Password) to verify your e-mail for the \'afi-Solve\' Complaint Management System by Afisol (Pvt) Ltd.\n' +
            '\n' +
            'OTP - '+generatedOTP+'\n' +
            '\n' +
            'NOTE : If you did not request any changes to your \'afisolve\' account, please notify us of this OTP via info.cmu@afisol.com ,  TP. ( 011 2352111 / 011 2112423 ), or any other convenient form, when you receive this e-mail to complete your registration.\n' +
            '\n' +
            'Best Regards,\n' +
            '\'afi-Solve\' Complaint Management Unit,\n' +
            'Afisol (Pvt) Ltd\n' +
            '_________________________________________________________________________\n' +
            'Disclaimer: This is a system-generated mail. For any queries, please contact the Company\n' +
            '_________________________________________________________________________\n'
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
