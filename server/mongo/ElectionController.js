import { runQuery } from './dbAccess.js'
import MongoDB from 'mongodb'

import Debug from 'debug'
const debug = Debug('mongo:ElectionController')

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
export function getElection (id) {
  return new Promise((resolve, reject) => {
    // Run the query itself
    runQuery(async (db) => {
      try {
        const result = await db.collection('elections').findOne({ _id: new MongoDB.ObjectID(id) })
        if (result === null) {
          debug('Election not found')
          return reject(new Error('No election with given id'))
        }
        debug('Retrieved election')
        return resolve(result)
      } catch (err) {
        debug('Error retrieving election', err)
        return reject(err)
      }
    })
  })
}

// Add new election
export async function addToElectionList (newElection) {
  return new Promise((resolve, reject) => {
    // Sanitize object
    const election = {
      name: newElection.name,
      description: newElection.description,
      startDate: newElection.startDate,
      endDate: newElection.endDate,
      poolID: new MongoDB.ObjectID(newElection.poolID)
    }

    debug(election)

    // Run the query to insert the data
    runQuery(async (db) => {
      try {
        // Validate the pool id more
        const result = await db.collection('pools').findOne({ _id: election.poolID })
        if (result === null) {
          return reject(new Error('Invalid Pool ID'))
        }

        // Insert the election
        const newDoc = await db.collection('elections').insertOne(election)
        debug('Inserted an election')
        return resolve(newDoc.insertedId)
      } catch (err) {
        debug('Error inserting election', err)
        return reject(err)
      }
    })
  })
}
