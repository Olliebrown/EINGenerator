import Election from '../../shared/Election.js'
import * as MONGO_VOTER_CTRL from '../mongo/VoterController.js'
import * as MONGO_ELECTION_CTRL from '../mongo/ElectionController.js'

import Debug from 'debug'
const debug = Debug('server:dataHelper')

export async function getElectionDetails (electionID, withVoters = true) {
  // Retrieve the election from the database
  let rawElection = null
  try {
    rawElection = await MONGO_ELECTION_CTRL.getElection(electionID)
  } catch (err) {
    debug(`Election not found with ID ${electionID}`)
    debug(err)
    return []
  }

  // Ensure the election object is ready for sending emails
  let election = null
  try {
    election = new Election(rawElection)
    if (!election.EIN || Object.keys(election.EIN).length < 1) {
      debug('Must generate EINs first')
      return []
    }
  } catch (err) {
    debug('Badly formed election (failed to parse to Election)')
    debug(err)
    return []
  }

  // Return just the election
  if (!withVoters) { return [election] }

  // Retrieve voter list details
  const voterIDs = Object.keys(election.EIN)
  let voters = []
  try {
    voters = await MONGO_VOTER_CTRL.getVoter(voterIDs)
  } catch (err) {
    debug('Missing details for one or more voters in election')
    debug(voterIDs)
    debug(err)
    return []
  }

  // Return the retrieved details
  return [election, voters]
}
