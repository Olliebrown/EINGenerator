import nodemailer from 'nodemailer'
import DotENV from 'dotenv'

// Initialize DotENV and variables
DotENV.config()
const SIB_SMTP_USER = (process.env.SIB_SMTP_USER || 'unknown')
const SIB_SMTP_PW = (process.env.SIB_SMTP_PW || 'bad-pass')

// Initialize SendinBlue transporter
const transporter = nodemailer.createTransport({
  service: 'SendinBlue',
  auth: {
    user: SIB_SMTP_USER,
    pass: SIB_SMTP_PW
  }
})

// Send an email
transporter.sendMail({
  from: 'do_not_reply@eingenerator.com',
  to: 'berriers@uwstout.edu',
  subject: 'Test Nodemailer Message',
  text: 'Plaintext version of the message',
  html: '<h1>HTML version of the message</h1>'
}).then((info) => {
  console.log(`Message sent: ${info.messageId}`)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}).catch((err) => {
  console.error('Sending failed')
  console.err(err)
})
