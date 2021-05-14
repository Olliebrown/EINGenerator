import { runQuery } from './dbAccess.js'
import MongoDB from 'mongodb'

import Debug from 'debug'
const debug = Debug('mongo:VoterController')

// CAUTION Drop entire voter collection
export function clearVoterList () {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('voters').drop()
        .then((data) => { debug('cleared voter list'); return resolve(data) })
        .catch((err) => { debug('Error clearing voter list', err); return reject(err) })
    })
  })
}

// Retrieve the list of voters
export function getVoterList () {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('voters').find({}).toArray()
        .then((data) => { debug('Retrieved voter list'); return resolve(data) })
        .catch((err) => { debug('Error retrieving voter list', err); return reject(err) })
    })
  })
}

// For now, summary and full list are the same
export function getSummaryVoterList () {
  return getVoterList()
}

// Find a specific voter
export function getVoter (id) {
  return new Promise((resolve, reject) => {
    // Run the query itself
    runQuery(async (db) => {
      try {
        const result = await db.collection('voters').findOne({ _id: new MongoDB.ObjectID(id) })
        if (result === null) {
          debug('Voter not found')
          return reject(new Error('No voter with given id'))
        }
        debug('Retrieved voter')
        return resolve(result)
      } catch (err) {
        debug('Error retrieving voter', err)
        return reject(err)
      }
    })
  })
}

// Add new voter
export async function addToVoterList (newVoters) {
  // Make sure it's always an array
  if (!Array.isArray(newVoters)) {
    newVoters = [newVoters]
  }

  // Sanitize documents before inserting
  const voters = newVoters.map((newVoter) => ({
    firstName: newVoter.firstName,
    lastName: newVoter.lastName,
    email: newVoter.email
  }))

  return new Promise((resolve, reject) => {
    // Run the query to insert the data
    runQuery(async (db) => {
      try {
        // Insert the voter
        const result = await db.collection('voters').insertMany(voters)
        debug(`Inserted ${result.insertedIds.length} voter(s)`)
        return resolve(result.insertedIds)
      } catch (err) {
        debug('Error inserting voter(s)', err)
        return reject(err)
      }
    })
  })
}

// Update a specific voter
export function updateVoter (id, updatedVoter) {
  return new Promise((resolve, reject) => {
    // Run the query itself
    runQuery(async (db) => {
      try {
        const result = await db.collection('voters').updateOne(
          { _id: new MongoDB.ObjectID(id) },
          updatedVoter
        )
        if (result.modifiedCount !== 1) {
          debug('Voter update failed')
          return reject(new Error('Failed to update voter'))
        }
        debug('Voter Updated')
        return resolve(result)
      } catch (err) {
        debug('Error updating voter', err)
        return reject(err)
      }
    })
  })
}
