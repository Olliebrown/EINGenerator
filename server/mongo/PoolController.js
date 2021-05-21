import { runQuery, closeClient } from './dbAccess.js'
import MongoDB from 'mongodb'

import Debug from 'debug'
const debug = Debug('mongo:PoolController')

// Re-export closeClient
export { closeClient }

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
export function getPool (poolIDs) {
  // Ensure IDs are an array and are the proper type
  if (!Array.isArray(poolIDs)) {
    poolIDs = [poolIDs]
  }
  poolIDs = poolIDs.map((id) => (typeof id === 'string' ? new MongoDB.ObjectID(id) : id))

  return new Promise((resolve, reject) => {
    // Run the query itself
    runQuery(async (db) => {
      try {
        const result = await db.collection('pools').find({ _id: { $in: poolIDs } }).toArray()
        if (result === null || (Array.isArray(result) && result.length < 1)) {
          debug('Voter pool(s) not found')
          return reject(new Error('No voter pool(s) with given id(s)'))
        }

        debug('Retrieved voter pool(s)')
        if (result.length === 1) {
          return resolve(result[0])
        }
        return resolve(result)
      } catch (err) {
        debug('Error retrieving voter pool(s)', err)
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
        debug(`Inserted ${Object.values(result.insertedIds).length} pool(s)`)
        return resolve(result.insertedIds)
      } catch (err) {
        debug('Error inserting pool(s)', err)
        return reject(err)
      }
    })
  })
}
