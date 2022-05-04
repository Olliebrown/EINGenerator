import Express from 'express'
import MongoDB from 'mongodb'
import Debug from 'debug'

import * as DATA_HELP from '../utils/dataHelper.js'
import * as EMAIL_HELP from '../utils/emailHelper.js'

const debug = Debug('server:emailService')
const router = new Express.Router()

function isValidString (value) {
  return !(!value || typeof value !== 'string')
}

function isValidSendBody ({ electionID, emailSubject, emailFrom, emailText }) {
  // Check basic types
  if (!isValidString(emailSubject) || !isValidString(emailFrom) || !isValidString(emailText)) {
    debug('Missing property or incorrect type')
    return false
  }

  // Check objectID
  if (!MongoDB.ObjectID.isValid(electionID)) {
    debug('Bad electionID')
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
    return res.status(400).json({
      error: true, message: 'Badly formed request body'
    })
  }

  // Destructure the body
  const { electionID, emailSubject, emailFrom, emailText, voterList } = req.body

  // If no voter list is provided, assume all voters should be included
  let voterEINList = voterList
  if (voterEINList === undefined) {
    const [election] = await DATA_HELP.getElectionDetails(electionID, false)
    voterEINList = Object.values(election.EIN).map((EINs) => (EINs[EINs.length - 1]))
  }

  // Start the email send job
  const emailJobID = await EMAIL_HELP.startEmailJob(electionID, emailFrom, emailSubject, emailText, voterEINList)
  return res.json({
    success: true, message: 'Email send job started', id: emailJobID
  })
})

// Check status of sent emails
router.get('/status/:id', async (req, res) => {
})

export default router
