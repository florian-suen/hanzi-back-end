import nodemailer from 'nodemailer';
import {EmailInput} from '../resolver/input-types/UsersInputs'
// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(email:string,html:string) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'meghan.mcdermott@ethereal.email', // generated ethereal user
      pass: 'PKf7JBg3xaPjy4yDSq' // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Heyan" <foo@example.com>', // sender address
    to: email, // list of receivers
    subject: "Changing password", // Subject line
    html // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

 