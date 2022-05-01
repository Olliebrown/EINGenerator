import { MongoClient, ServerApiVersion } from 'mongodb'
import DotENV from 'dotenv'

import Debug from 'debug'
const debug = Debug('mongo:DBAccess')

// Initialize DotENV and variables
DotENV.config()
const DB_USER = (process.env.DB_USER || 'unknown')
const DB_PASS = (process.env.DB_PASS || 'bad-pass')
const DB_NAME = (process.env.DB_NAME || 'EINTest')

// Build the URL using protected username and password
const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@berriercluster.m5otq.mongodb.net/?retryWrites=true&w=majority`

// Build the client to be used for all connections
// const client = new MongoDB.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

// Run a query using the provided query callback (receives the database object)
export async function runQuery (queryCB) {
  // Establish a connection (if not already)
  try {
    await client.connect()
  } catch (err) {
    debug('Error connecting to mongo', err)
    throw (new Error('Failed to connect to mongodb'))
  }

  // Run the provided query callback (asynchronously)
  try {
    if (queryCB) {
      await queryCB(client.db(DB_NAME))
    }
  } catch (err) {
    debug('Mongo Query failed', err)
    throw (new Error('Failed to run query'))
  }
}

export async function closeClient () {
  // Establish a connection (if not already)
  try {
    if (client.isConnected()) {
      debug('Disconnecting from mongo ...')
      await client.close()
      debug('... success')
    }
  } catch (err) {
    debug('Error disconnecting from mongo', err)
    throw (new Error('Failed to disconnect from mongodb'))
  }
}
