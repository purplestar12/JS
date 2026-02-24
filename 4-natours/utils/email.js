const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: './../config.env' });

const sendEmail = async (options) => {
  //create a Transporter
  const mailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAILTRAP_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //Define email options
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //Actually send the email
  await mailTransporter.sendMail(mailOptions);
};

module.exports = sendEmail;

// exports.checkGmailSending = async (req, res, next) => {
//   let mailTransporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   let mailDetails = {
//     from: process.env.EMAIL_USERNAME,
//     to: 'priyankamarappan23@gmail.com',
//     subject: 'Test mail',
//     text: 'Node.js testing mail for natours',
//   };

//   await mailTransporter.sendMail(mailDetails, function (err, data) {
//     if (err) {
//       console.log('Error Occurs');
//     } else {
//       console.log('Email sent successfully');
//     }
//   });
//   res.status(200).json({
//     status: 'success',
//     message: 'gmail sent',
//   });
// };
