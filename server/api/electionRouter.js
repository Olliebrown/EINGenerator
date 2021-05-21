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
    const newID = await MONGO_ELECTION_CTRL.addToElectionList(JSON.parse(req.body))
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
router.post('/:id/generateEIN', async (req, res) => {
  // Attempt to retrieve election object
  const electionID = req.params.id
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
    election.makeNewEINList(pool.members, 9)
    await MONGO_ELECTION_CTRL.updateElection(electionID, election)
    return res.json({ success: true, message: 'EIN List generated', EIN: election.EIN })
  } catch (err) {
    return res.status(500).json({
      error: true, message: 'Failed to generate and store EINs', err
    })
  }
})

export default router
