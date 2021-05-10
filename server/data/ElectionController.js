import Debug from 'debug'
import fs from 'fs'
import path from 'path'

const debug = Debug('server:ElectionController')

// Max time to wait for a file to be freed up
const MAX_WAIT = 10000
const ELECTION_DATA_FILE = path.resolve('./server/data/ElectionData.json')

// Store and return the list of elections
const electionList = JSON.parse(fs.readFileSync(ELECTION_DATA_FILE, { encoding: 'utf8' }))
export function getElectionList () {
  return electionList
}

// Summarize the list of elections
export function getElectionListSummary () {
  return electionList.map((election) => ({ id: election.id, name: election.name }))
}

// Update list file
let ELECTION_FILE_IN_USE = false
export async function addToElectionList (newElection) {
  // Wait for file to be available
  let waited = 0
  // eslint-disable-next-line no-unmodified-loop-condition
  while (ELECTION_FILE_IN_USE && waited < MAX_WAIT) {
    await new Promise((resolve) => { setTimeout(() => { resolve() }, 100) })
    waited += 100
  }

  // Did we time-out or are we done
  if (ELECTION_FILE_IN_USE) {
    debug('Timed out waiting to write to election file')
    return
  }

  // Flag file as in use and update array
  ELECTION_FILE_IN_USE = true
  electionList.push(newElection)

  // Write to the file
  fs.writeFile(ELECTION_DATA_FILE,
    JSON.stringify(electionList), { encoding: 'utf8' },
    (err) => {
      // Check for error and clear usage flag
      if (err) {
        debug('Failed to update election file: ' + err)
      }
      ELECTION_FILE_IN_USE = false
    }
  )
}
