import Express from 'express'
import Debug from 'debug'

import Voter from '../../shared/Voter.js'
import * as MONGO_CTRL from '../mongo/VoterController.js'

const debug = Debug('server:voterRouter')
const router = new Express.Router()

// Create a new voter from JSON info in body
router.put('/create', Express.raw({ type: '*/*' }), async (req, res) => {
  // Validate request body
  if (!Buffer.isBuffer(req.body)) {
    debug('Request body invalid or missing')
    return res.status(400).json({ error: true, message: 'body of request missing' })
  }

  // Attempt to parse body and insert
  try {
    const newVoter = Voter.parse(req.body)
    const result = await MONGO_CTRL.addToVoterList(newVoter)
    return res.json({ success: true, message: 'New voter added to list', id: result[0] })
  } catch (err) {
    debug('Failed to insert voter')
    return res.status(400).json({
      error: true, message: `Failed to insert: ${err.message}`
    })
  }
})

// Retrieve summary list of voters
router.get('/', async (req, res) => {
  try {
    res.json(await MONGO_CTRL.getVoterListSummary())
  } catch (err) {
    res.status(400).json({
      error: true, message: `Failed to get summary: ${err.message}`
    })
  }
})

// Retrieve details for indicated voter
router.get('/:id', async (req, res) => {
  const voterID = req.params.id

  try {
    const match = await MONGO_CTRL.getVoter(voterID)
    return res.json(match)
  } catch (err) {
    return res.status(404).json({
      error: true, message: `Voter voter not found with ID ${voterID}`, err
    })
  }
})

// Retrieve details for a list of voters (full details)
router.post('/', Express.json({ type: '*/*' }), async (req, res) => {
  const voterIDs = req.body

  try {
    const match = await MONGO_CTRL.getVoter(voterIDs)
    return res.json(match)
  } catch (err) {
    return res.status(404).json({
      error: true, message: 'Voter(s) not found for ID list', voterIDs, err
    })
  }
})

export default router
