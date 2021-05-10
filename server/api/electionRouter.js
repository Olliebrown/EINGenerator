import Express from 'express'
import Debug from 'debug'

import * as MONGO_CTRL from '../mongo/ElectionController.js'

const debug = Debug('server:electionRouter')
const router = new Express.Router()

// Create a new election from JSON info in body
router.put('/create', Express.raw({ type: '*/*' }), async (req, res) => {
  // Validate provided request body
  if (!req.body) {
    debug('Request body invalid or missing')
    return res.status(400).json({ error: true, message: 'body of request missing' })
  }

  try {
    const newID = await MONGO_CTRL.addToElectionList(JSON.parse(req.body))
    return res.json({ success: true, message: 'New election added to list', id: newID })
  } catch (err) {
    debug('Failed to insert election')
    return res.status(400).json({
      error: true, message: `Failed to insert: ${err.message}`
    })
  }
})

// Retrieve summary list of elections
router.get('/', async (req, res) => {
  try {
    res.json(await MONGO_CTRL.getElectionListSummary())
  } catch (err) {
    res.status(400).json({
      error: true, message: `Failed to get summary: ${err.message}`
    })
  }
})

// Retrieve details for indicated pool
router.get('/:id', async (req, res) => {
  const electionID = req.params.id

  try {
    const match = await MONGO_CTRL.getElection(electionID)
    return res.json(match)
  } catch (err) {
    return res.status(404).json({
      error: true, message: `Election not found with ID ${electionID}`, err
    })
  }
})

export default router
