import { runQuery, closeClient } from './dbAccess.js'
import MongoDB from 'mongodb'

import Debug from 'debug'
const debug = Debug('mongo:EmailJobController')

// Re-export closeClient
export { closeClient }

// Add new voter
export function addEmailJob (newJob) {
  return new Promise((resolve, reject) => {
    // Ensure we have a valid electionID
    if (!newJob.electionID || !MongoDB.ObjectId.isValid(newJob.electionID)) {
      return reject(new Error('Improperly formed job'))
    }

    // Sanitize document before inserting
    const newJobDoc = {
      electionID: new MongoDB.ObjectId(newJob.electionID),
      from: newJob.from,
      subject: newJob.subject,
      bodyText: newJob.bodyText,
      emailType: newJob.emailType,
      voterEINList: newJob.voterEINList,
      expected: newJob.expected || 0,
      successCount: 0,
      pendingCount: 0,
      failedCount: 0,
      status: null
    }

    // Run the query to insert the data
    runQuery(async (db) => {
      try {
        // Validate the election id
        const election = await db.collection('elections').findOne({ _id: new MongoDB.ObjectId(newJob.electionID) })
        if (election === null) {
          return reject(new Error(`Invalid electionID ${newJob.electionID})`))
        }

        // Insert the email job
        const result = await db.collection('emailJobs').insertOne(newJobDoc)
        debug(`Inserted new Email Job ${result.insertedId}`)
        return resolve(result.insertedId)
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
  emailJobID = new MongoDB.ObjectId(emailJobID)

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
  emailJobID = new MongoDB.ObjectId(emailJobID)

  return new Promise((resolve, reject) => {
    // Run the query itself
    runQuery(async (db) => {
      try {
        // Basic updateOne call
        const result = await db.collection('emailJobs').updateOne(
          { _id: emailJobID },
          { $set: newJobDetails }
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
