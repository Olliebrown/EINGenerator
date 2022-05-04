// Import nodemailer for sending emails
import nodemailer from 'nodemailer'

// Import the handlebars template library and commonmark MD parser
import Handlebars from 'handlebars'
import * as Commonmark from 'commonmark'

// Import local data objects and DB controllers
import EmailJob from './EmailJob.js'
import * as MONGO_EMAIL_CTRL from '../mongo/EmailJobController.js'

// Helper to retrieve election and voter data from DB
import * as DATA_HELP from '../utils/dataHelper.js'

// Import the 'debug' library
import Debug from 'debug'

// Initialize DotENV and sendin blue auth object
import DotENV from 'dotenv'
DotENV.config()

// Sendin blue config
const SMTP_SIB_CONFIG = {
  service: 'SendinBlue',
  auth: {
    user: (process.env.SIB_SMTP_USER || 'unknown'),
    pass: (process.env.SIB_SMTP_PW || 'bad-pass')
  }
}

// Testing config (ethereal.email)
const SMTP_TEST_CONFIG = {
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: (process.env.TEST_SMTP_USER || 'unknown'),
    pass: (process.env.TEST_SMTP_PW || 'bad-pass')
  }
}

// Always default to testing!
const SMTP_SEND = (process.env.SMTP_SEND || false)

// Create debug interface
const debug = Debug('server:emailHelper')

// Wait time between email sending
const THROTTLE_TIME = 500

// Prepare to parse and render Markdown
const MDReader = new Commonmark.Parser({ smart: true })
const MDWriter = new Commonmark.HtmlRenderer()

// Create the email job and start sending email asynchronously
export function startEmailJob (electionID, emailFrom, emailSubject, emailText, emailType, voterEINList) {
  return new Promise((resolve, reject) => {
    // Confirm voter list
    if (!Array.isArray(voterEINList) || voterEINList.length < 1) {
      reject(new Error('Invalid voter list. Must be an array of at least length 1.'))
    }

    // Construct a new email job object
    const newEmailJob = new EmailJob({
      id: '*', electionID, from: emailFrom, subject: emailSubject, bodyText: emailText, emailType, voterEINList
    })

    // Generate and return an ID
    MONGO_EMAIL_CTRL.addEmailJob(newEmailJob)
      .then((newJobID) => {
        // Update job id
        newEmailJob.id = newJobID

        // Start the sending job (returns immediately) then resolve with job ID
        sendEmails(newEmailJob)
        return resolve(newJobID)
      })
      .catch((err) => {
        debug('Failed to add new job')
        return reject(err)
      })
  })
}

// Job to send out emails (not meant to be awaited, let run in background)
export async function sendEmails (emailJob) {
  // Get list of voter emails with eins
  const [election, voters] = await DATA_HELP.getElectionDetails(emailJob.electionID, true)
  if (!election || !voters) {
    debug('Invalid election or voter list for sending emails')
    emailJob.addFailure('Invalid election or voter list for sending emails')
    return
  }

  // Filter the voters list to match the EIN list
  const votersFiltered = voters.filter((voter) => {
    // Lookup this voter's EIN
    const EINList = election.EIN[voter.id]
    const curEIN = EINList[EINList.length - 1]

    // Is that EIN in the email job list?
    return (emailJob.voterEINList.findIndex((item) => curEIN === item) >= 0)
  })

  // Update job with expected number of emails
  emailJob.expected = votersFiltered.length

  // Create the nodemailer transport object
  const transporter = nodemailer.createTransport(
    (SMTP_SEND ? SMTP_SIB_CONFIG : SMTP_TEST_CONFIG)
  )

  // Pre-compile the message template (if handlebars are detected)
  let msgTemplate = null
  try {
    if (emailJob.bodyText.match(/\{\{.*\}\}/)) {
      msgTemplate = Handlebars.compile(emailJob.bodyText)
    }
  } catch (err) {
    emailJob.addFailure('Invalid Handlebars Template')
    debug('Invalid Handlebars Template')
    debug(err)
    return
  }

  // Start sending emails
  debug(`Sending ${votersFiltered.length} email(s):`)
  for (let i = 0; i < votersFiltered.length; i++) {
    // Gather needed data
    const to = votersFiltered[i].email

    // Fill in template (if exists)
    let compiledBodyText = emailJob.bodyText
    if (msgTemplate) {
      compiledBodyText = msgTemplate({
        EIN: election.EIN[votersFiltered[i]._id][0],
        voter: votersFiltered[i],
        election
      })
    }

    // Send the email (using nodemailer)
    try {
      debug(`> Sending ${(SMTP_SEND ? '' : 'TEST')} email to '${to}'`)
      const messageInfo = await sendOneEmail(transporter, to, emailJob.from, emailJob.subject, compiledBodyText)
      emailJob.addStatus(messageInfo, votersFiltered[i]._id, votersFiltered[i].email)
    } catch (err) {
      debug('      Error sending')
      debug(err)
      emailJob.addFailure(err, votersFiltered[i]._id, votersFiltered[i].email)
    }

    // Update email job status
    await MONGO_EMAIL_CTRL.updateEmailJob(emailJob.id, {
      expected: emailJob.expected,
      successCount: emailJob.successCount,
      pendingCount: emailJob.pendingCount,
      failedCount: emailJob.failedCount,
      status: emailJob.status
    })

    // Throttle sending by waiting
    if (THROTTLE_TIME) {
      await new Promise((resolve) => { setTimeout(() => { resolve() }, THROTTLE_TIME) })
    }
  }
}

function sendOneEmail (transporter, to, from, subject, bodyText, templateData = {}) {
  // Fill in Handlebars template in body (if any)
  if (templateData && bodyText.match(/\{\{.*\}\}/)) {
    const msgTemplate = Handlebars.compile(bodyText)
    bodyText = msgTemplate(templateData)
  }

  // Render Markdown text as HTML
  const AST = MDReader.parse(bodyText)
  const bodyHTML = MDWriter.render(AST)

  // Send the email
  return new Promise((resolve, reject) => {
    transporter.sendMail({
      from,
      to,
      subject,
      text: bodyText,
      html: bodyHTML
    }, (err, info) => {
      if (err) { return reject(err) }
      return resolve(info)
    })
  })
}
