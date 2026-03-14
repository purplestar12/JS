const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const pug = require('pug');
const { convert } = require('html-to-text');

dotenv.config({ path: './../config.env' });

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.GMAIL_USERNAME;
  }

  createNewTransport() {
    if (process.env.NODE_ENV === 'production') {
      //mailTransporter - gmail
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
    }
    //mailtrap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAILTRAP_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    console.log('sending...............');

    // 1) RENDER HTML - BASED ON A PUG TEMPLATE
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) DEFINE EMAIL OPTIONS
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    // 3) CREATE A TRANSPORT AND SEND EMAIL
    await this.createNewTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    console.log('after sendwelcome');

    console.log('welcomeeeeeeee');
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    console.log('settttttttttttt');
    await this.send(
      'passwordReset',
      'Your password reset token (valid only for 10 minutes)',
    );
    console.log('setyyyyyyyyyyyyyy');
  }
};

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
