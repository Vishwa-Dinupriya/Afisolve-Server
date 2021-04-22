// const {Auth} = require('two-step-auth');
const nodemailer = require('nodemailer');

const otpGenerator = require('otp-generator');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vishwagamage808@gmail.com',
        pass: 'Sanju@1223'
    }
});

let generatedOTP;

async function sendOtp(receiverEmail) {
    // You can follow the above approach, But we recommend you to follow the one below, as the mails will be treated as important
    generatedOTP = otpGenerator.generate(8, {digits: true, alphabets: false, upperCase: false, specialChars: false});
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

async function getGeneratedOTP(){
    return generatedOTP;
}
module.exports = {
     sendOtp,getGeneratedOTP
}
