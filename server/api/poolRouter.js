import Express from 'express'
import Debug from 'debug'

import Pool from '../../shared/Pool.js'
import * as MONGO_CTRL from '../mongo/PoolController.js'

const debug = Debug('server:voterPoolRouter')
const router = new Express.Router()

// Create a new pool from JSON info in body
router.put('/create', Express.raw({ type: '*/*' }), async (req, res) => {
  // Validate request body
  if (!Buffer.isBuffer(req.body)) {
    debug('Request body invalid or missing')
    return res.status(400).json({ error: true, message: 'body of request missing' })
  }

  // Attempt to parse body and insert
  try {
    const newVoterPool = Pool.parse(req.body)
    await MONGO_CTRL.addToPoolList(newVoterPool)
    return res.json({ success: true, message: 'New voter pool added to list', id: newVoterPool.id })
  } catch (err) {
    debug('Failed to insert voter pool')
    return res.status(400).json({
      error: true, message: `Failed to insert: ${err.message}`
    })
  }
})

// Retrieve summary list of pools
router.get('/', async (req, res) => {
  try {
    res.json(await MONGO_CTRL.getPoolListSummary())
  } catch (err) {
    res.status(400).json({
      error: true, message: `Failed to get summary: ${err.message}`
    })
  }
})

// Retrieve details for indicated pool
router.get('/:id', async (req, res) => {
  const poolID = req.params.id

  try {
    const match = await MONGO_CTRL.getPool(poolID)
    return res.json(match)
  } catch (err) {
    return res.status(404).json({
      error: true, message: `Voter pool not found with ID ${poolID}`, err
    })
  }
})

// Retrieve details for a list of voter pools (full details)
router.post('/', Express.json({ type: '*/*' }), async (req, res) => {
  const poolIDs = req.body
  try {
    const match = await MONGO_CTRL.getPool(poolIDs)
    return res.json(match)
  } catch (err) {
    return res.status(404).json({
      error: true, message: 'Pool(s) not found for ID list', poolIDs, err
    })
  }
})

export default router
