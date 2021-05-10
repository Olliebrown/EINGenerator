import { runQuery } from './dbAccess.js'
import MongoDB from 'mongodb'

import Debug from 'debug'
const debug = Debug('mongo:PoolController')

// Retrieve the list of voter pools
export function getPoolList () {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('pools').find({}).toArray()
        .then((data) => { debug('Retrieved voter pool list'); return resolve(data) })
        .catch((err) => { debug('Error retrieving voter pool list', err); return reject(err) })
    })
  })
}

// Summarize the list of pools
export function getPoolListSummary () {
  return new Promise((resolve, reject) => {
    // Run the query itself
    runQuery(async (db) => {
      try {
        const list = await db.collection('pools').find()
          .project({ _id: 1, name: 1 }).toArray()
        debug('Summarizing voter pool list')
        return resolve(list)
      } catch (err) {
        debug('Error summarizing voter pool list', err)
        return reject(err)
      }
    })
  })
}

// Find a specific voter pool
export function getPool (id) {
  return new Promise((resolve, reject) => {
    // Run the query itself
    runQuery(async (db) => {
      try {
        const result = await db.collection('pools').findOne({ _id: new MongoDB.ObjectID(id) })
        if (result === null) {
          debug('Voter pool not found')
          return reject(new Error('No voter pool with given id'))
        }
        debug('Retrieved voter pool')
        return resolve(result)
      } catch (err) {
        debug('Error retrieving voter pool', err)
        return reject(err)
      }
    })
  })
}

// Update pool list file
export async function addToPoolList (newPool) {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('pools').insertOne(newPool)
        .then((data) => { debug('Inserted a voter pool'); return resolve() })
        .catch((err) => { debug('Error inserting voter pool', err); return reject(err) })
    })
  })
}
