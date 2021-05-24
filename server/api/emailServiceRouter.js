import Express from 'express'
import MongoDB from 'mongodb'
import Debug from 'debug'

import * as EMAIL_HELP from '../utils/emailHelper'

const debug = Debug('server:emailService')
const router = new Express.Router()

function isValidString (value) {
  return !(!value || typeof value !== 'string')
}

function isValidSendBody ({ electionID, emailSubject, emailFrom, emailText }) {
  // Check basic types
  if (!isValidString(emailSubject) || !isValidString(emailFrom) || !isValidString(emailText)) {
    return false
  }

  // Check objectID
  if (!MongoDB.ObjectID.isValid(electionID)) {
    return false
  }

  // All is well
  return true
}

// Send initial emails
router.post('/send', Express.json({ type: '*/*' }), async (req, res) => {
  // Check body of request
  if (!req.body || !isValidSendBody(req.body)) {
    debug('Badly formed email send request')
    debug(req.body)
    return res.status(400).json({
      error: true, message: 'Badly formed request body'
    })
  }

  // Destructure the body
  const { electionID, emailSubject, emailFrom, emailText } = req.body

  // Start the email send job
  const emailJobID = EMAIL_HELP.sendEmails(electionID, emailFrom, emailSubject, emailText)
  return res.json({
    success: true, message: 'Email send job started', id: emailJobID
  })
})

// Check status of sent emails
router.get('/status/:id', async (req, res) => {
})

export default router
