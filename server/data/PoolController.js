import Debug from 'debug'
import fs from 'fs'
import path from 'path'

const debug = Debug('server:PoolController')

// Max time to wait for a file to be freed up
const MAX_WAIT = 10000
const POOL_DATA_FILE = path.resolve('./server/data/VoterPoolData.json')

// Store and return the list of pools
const poolList = JSON.parse(fs.readFileSync(POOL_DATA_FILE, { encoding: 'utf8' }))
export function getPoolList () {
  return poolList
}

// Summarize the list of pools
export function getPoolListSummary () {
  return poolList.map((pool) => ({ id: pool.id, name: pool.name }))
}

// Update pool list file
let POOL_FILE_IN_USE = false
export async function addToPoolList (newPool) {
  // Wait for pool file to be available
  let waited = 0
  // eslint-disable-next-line no-unmodified-loop-condition
  while (POOL_FILE_IN_USE && waited < MAX_WAIT) {
    await new Promise((resolve) => { setTimeout(() => { resolve() }, 100) })
    waited += 100
  }

  // Did we time-out or are we done
  if (POOL_FILE_IN_USE) {
    debug('Timed out waiting to write to pool file')
    return
  }

  // Flag pool file as in use and update array
  POOL_FILE_IN_USE = true
  poolList.push(newPool)

  // Write to the pool file
  fs.writeFile(POOL_DATA_FILE,
    JSON.stringify(poolList), { encoding: 'utf8' },
    (err) => {
      // Check for error and clear usage flag
      if (err) {
        debug('Failed to update pool file: ' + err)
      }
      POOL_FILE_IN_USE = false
    }
  )
}
