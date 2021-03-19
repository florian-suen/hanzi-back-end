import nodemailer from 'nodemailer';

export async function sendEmail(email:string,html:string) {

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, 
    auth: {
      user: 'meghan.mcdermott@ethereal.email', 
      pass: 'PKf7JBg3xaPjy4yDSq' 
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Heyan" <foo@example.com>', 
    to: email, 
    subject: "Changing password", 
    html 
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

}

 