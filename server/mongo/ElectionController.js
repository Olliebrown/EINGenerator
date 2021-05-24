import { runQuery, closeClient } from './dbAccess.js'
import MongoDB from 'mongodb'

import Debug from 'debug'
const debug = Debug('mongo:ElectionController')

// Re-export closeClient
export { closeClient }

// CAUTION Drop entire election collection
export function clearElectionList () {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('elections').drop()
        .then((data) => { debug('cleared election list'); return resolve(data) })
        .catch((err) => { debug('Error clearing election list', err); return reject(err) })
    })
  })
}

// Store and return the list of elections
export function getElectionList () {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('elections').find({}).toArray()
        .then((data) => { debug('Retrieved election list'); return resolve(data) })
        .catch((err) => { debug('Error retrieving election list', err); return reject(err) })
    })
  })
}

// Summarize the list of elections
export function getElectionListSummary () {
  return new Promise((resolve, reject) => {
    // Run the query itself
    runQuery(async (db) => {
      try {
        const list = await db.collection('elections').find()
          .project({ _id: 1, name: 1 }).toArray()
        debug('Summarizing election list')
        return resolve(list)
      } catch (err) {
        debug('Error summarizing election list', err)
        return reject(err)
      }
    })
  })
}

// Find a specific election
export function getElection (electionIDs) {
  // Ensure IDs are an array and of the proper type
  if (!Array.isArray(electionIDs)) {
    electionIDs = [electionIDs]
  }
  electionIDs = electionIDs.map((id) => (typeof id === 'string' ? new MongoDB.ObjectID(id) : id))

  return new Promise((resolve, reject) => {
    // Run the query itself
    runQuery(async (db) => {
      try {
        const result = await db.collection('elections').find({ _id: { $in: electionIDs } }).toArray()
        if (result === null || (Array.isArray(result) && result.length < 1)) {
          debug('Elections(s) not found')
          return reject(new Error('No election(s) with given id(s)'))
        }

        debug('Retrieved election(s)')
        if (result.length === 1) {
          return resolve(result[0])
        }
        return resolve(result)
      } catch (err) {
        debug('Error retrieving election', err)
        return reject(err)
      }
    })
  })
}

// Add new election
export async function addToElectionList (newElections) {
  // Make sure it's always an array
  if (!Array.isArray(newElections)) {
    newElections = [newElections]
  }

  // Sanitize documents before inserting
  const elections = newElections.map((newElection) => ({
    name: newElection.name,
    description: newElection.description,
    startDate: newElection.startDate,
    endDate: newElection.endDate,
    poolID: new MongoDB.ObjectID(newElection.poolID),
    EIN: newElection.EIN
  }))

  // Get list of only poolIDs (unique)
  let poolIDs = []
  elections.forEach((election) => {
    if (!poolIDs.includes(election.poolID.toString())) {
      poolIDs.push(election.poolID.toString())
    }
  })
  poolIDs = poolIDs.map((id) => (new MongoDB.ObjectID(id)))

  return new Promise((resolve, reject) => {
    // Run the query to insert the data
    runQuery(async (db) => {
      try {
        // Validate the pool ids
        const result1 = await db.collection('pools').find({ _id: { $in: poolIDs } }).project({ _id: 1 }).toArray()
        if (result1.length !== poolIDs.length) {
          return reject(new Error(`One or more invalid Pool IDs (${poolIDs.length} expected, got ${result1.length})`))
        }

        // Insert the elections
        const result2 = await db.collection('elections').insertMany(elections)
        debug(`Inserted ${Object.values(result2.insertedIds).length} election(s)`)
        return resolve(Object.values(result2.insertedIds))
      } catch (err) {
        debug('Error inserting election(s)', err)
        return reject(err)
      }
    })
  })
}

// Update a specific election
export function updateElection (id, updatedFields) {
  debug('Update Election started')

  return new Promise((resolve, reject) => {
    // Run the query itself
    runQuery(async (db) => {
      try {
        const result = await db.collection('elections').updateOne(
          { _id: new MongoDB.ObjectID(id) },
          { $set: updatedFields }
        )
        if (result.modifiedCount !== 1) {
          debug('Election update failed')
          return reject(new Error('Failed to update election'))
        }
        debug('Election Updated')
        return resolve(result)
      } catch (err) {
        debug('Error updating election', err)
        return reject(err)
      }
    })
  })
}
