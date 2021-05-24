import { runQuery, closeClient } from './dbAccess.js'
import MongoDB from 'mongodb'

import Debug from 'debug'
const debug = Debug('mongo:EmailJobController')

// Re-export closeClient
export { closeClient }

// Add new voter
export function addEmailJob (newJob) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(newJob.toIDs)) {
      return reject(new Error('Improperly formed job'))
    }

    // Sanitize document before inserting
    const newJobDoc = {
      toIDs: newJob.toIDs.map((id) => (new MongoDB.ObjectID(id))),
      from: newJob.from,
      subject: newJob.subject,
      bodyText: newJob.bodyText,
      successCount: 0,
      failCount: 0,
      errorList: []
    }

    // Run the query to insert the data
    runQuery(async (db) => {
      try {
        // Insert the voter
        const result = await db.collection('emailJobs').insertOne(newJobDoc)
        debug(`Inserted new Email Job ${result._id}`)
        return resolve(result._id)
      } catch (err) {
        debug('Error inserting email job', err)
        return reject(err)
      }
    })
  })
}

// Find specific email job
export function getEmailJob (emailJobID) {
  // Ensure ID is proper type
  emailJobID = new MongoDB.ObjectID(emailJobID)

  return new Promise((resolve, reject) => {
    // Run the query itself
    runQuery(async (db) => {
      try {
        const result = await db.collection('emailJobs').findOne({ _id: emailJobID })
        if (result === null) {
          debug('Email Job not found')
          return reject(new Error('No email job with given id'))
        }

        debug('Retrieved email job')
        return resolve(result)
      } catch (err) {
        debug('Error retrieving email job', err)
        return reject(err)
      }
    })
  })
}

// Update a specific email job
export function updateEmailJob (emailJobID, newJobDetails) {
  // Ensure ID is proper type
  emailJobID = new MongoDB.ObjectID(emailJobID)

  return new Promise((resolve, reject) => {
    // Run the query itself
    runQuery(async (db) => {
      try {
        // Basic updateOne call
        const result = await db.collection('emailJobs').updateOne(
          { _id: emailJobID }, newJobDetails
        )

        // Check that ONE item was modified
        if (result.modifiedCount !== 1) {
          debug('Email job update failed')
          return reject(new Error('Failed to update email job'))
        }

        // Resolve successfully
        debug('Email job Updated')
        return resolve(result)
      } catch (err) {
        debug('Error updating email job', err)
        return reject(err)
      }
    })
  })
}
