import { runQuery } from './dbAccess.js'
import MongoDB from 'mongodb'

import Debug from 'debug'
const debug = Debug('mongo:PoolController')

// CAUTION Drop entire pool collection
export function clearPoolList () {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('pools').drop()
        .then((data) => { debug('cleared pool list'); return resolve(data) })
        .catch((err) => { debug('Error clearing pool list', err); return reject(err) })
    })
  })
}

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
export async function addToPoolList (newPools) {
  // Make sure it's always an array
  if (!Array.isArray(newPools)) {
    newPools = [newPools]
  }

  // Sanitize documents before inserting
  const pools = newPools.map((newPool) => ({
    name: newPool.name,
    description: newPool.description,
    members: newPool.members?.map((memberID) => (new MongoDB.ObjectID(memberID)))
  }))

  return new Promise((resolve, reject) => {
    runQuery(async (db) => {
      try {
        // Insert the voter
        const result = await db.collection('pools').insertMany(pools)
        debug(`Inserted ${result.insertedIds.length} pool(s)`)
        return resolve(result.insertedIds)
      } catch (err) {
        debug('Error inserting pool(s)', err)
        return reject(err)
      }
    })
  })
}
