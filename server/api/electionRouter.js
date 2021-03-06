import Express from 'express'
import Debug from 'debug'

import Election from '../../shared/Election.js'
import * as MONGO_POOL_CTRL from '../mongo/PoolController.js'
import * as MONGO_ELECTION_CTRL from '../mongo/ElectionController.js'

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
    const newIDs = await MONGO_ELECTION_CTRL.addToElectionList(JSON.parse(req.body))
    return res.json({ success: true, message: 'New election added to list', id: newIDs[0] })
  } catch (err) {
    debug('Failed to insert election')
    return res.status(400).json({
      error: true, message: `Failed to insert: ${err.message}`
    })
  }
})

// Update details for indicated election
router.post('/:id/update', Express.raw({ type: '*/*' }), async (req, res) => {
  // Validate provided request body
  if (!req.body) {
    debug('Request body invalid or missing')
    return res.status(400).json({ error: true, message: 'body of request missing' })
  }

  const electionID = req.params.id

  try {
    const newElection = JSON.parse(req.body)
    await MONGO_ELECTION_CTRL.updateElection(electionID, newElection)

    return res.json({ success: true, message: 'Election updated' })
  } catch (err) {
    debug('Failed to update election')
    return res.status(400).json({
      error: true, message: `Failed to update election: ${err.message}`
    })
  }
})

// Retrieve summary list of elections
router.get('/', async (req, res) => {
  try {
    res.json(await MONGO_ELECTION_CTRL.getElectionListSummary())
  } catch (err) {
    res.status(400).json({
      error: true, message: `Failed to get summary: ${err.message}`
    })
  }
})

// Retrieve details for indicated election
router.get('/:id', async (req, res) => {
  const electionID = req.params.id

  try {
    const match = await MONGO_ELECTION_CTRL.getElection(electionID)
    return res.json(match)
  } catch (err) {
    return res.status(404).json({
      error: true, message: `Election not found with ID ${electionID}`, err
    })
  }
})

// Retrieve email table for indicated election
router.get(':id/emailTable', async (req, res) => {
  const electionID = req.params.id

  try {
    const match = await MONGO_ELECTION_CTRL.getElectionEmailTable(electionID)
    return res.json(match)
  } catch (err) {
    return res.status(404).json({
      error: true, message: `Election not found with ID ${electionID}`, err
    })
  }
})

// Retrieve details for a list of elections (full details)
router.post('/', Express.json({ type: '*/*' }), async (req, res) => {
  const electionIDs = req.body
  try {
    const match = await MONGO_ELECTION_CTRL.getElection(electionIDs)
    return res.json(match)
  } catch (err) {
    return res.status(404).json({
      error: true, message: 'Election(s) not found for ID list', electionIDs, err
    })
  }
})

// Trigger EIN generation for indicated election
router.post('/generateEIN', Express.json({ type: '*/*' }), async (req, res) => {
  // Attempt to retrieve election object
  const electionID = req.body?.id
  let election = null
  try {
    const match = await MONGO_ELECTION_CTRL.getElection(electionID)
    election = new Election(match)
  } catch (err) {
    return res.status(404).json({
      error: true, message: `Election not found with ID ${electionID}`, err
    })
  }

  // Does this election already have EINs
  if (election.EIN !== null) {
    return res.status(400).json({
      error: true, message: 'Election already has EINs'
    })
  }

  // Attempt to retrieve associated voter pool
  let pool = null
  try {
    pool = await MONGO_POOL_CTRL.getPool(election.poolID)
  } catch (err) {
    return res.status(404).json({
      error: true, message: `No pool found for ID ${election.poolID}`, err
    })
  }

  // Attempt to generate the EIN list
  try {
    election.makeNewEINList(pool, 9)
    await MONGO_ELECTION_CTRL.updateElection(electionID, { EIN: election.EIN })
    return res.json({ success: true, message: 'EIN List generated', EIN: election.EIN })
  } catch (err) {
    debug('EIN List Generation failed')
    return res.status(500).json({
      error: true, message: 'Failed to update election and store EINs', errString: err.toString()
    })
  }
})

export default router
