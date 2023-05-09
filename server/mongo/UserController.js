import { runQuery, closeClient } from './dbAccess.js'

import bcrypt from 'bcrypt'
import MongoDB from 'mongodb'

import Debug from 'debug'

// How many rounds to use when generating hash salt for passwords
const SALT_ROUNDS = 10

// Re-export closeClient
export { closeClient }

const debug = Debug('mongo:UserController')

// Extract ObjectId for easy usage
const { ObjectId } = MongoDB

export function getUserList () {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('users').find({}).project({ email: 1, name: 1, userType: 1 }).toArray()
        .then((data) => resolve(data))
        .catch((err) => { debug('Error retrieving user list', err); return reject(err) })
    })
  })
}

export function getUserDetails (userID) {
  return new Promise((resolve, reject) => {
    if (!ObjectId.isValid(userID)) {
      return reject(new Error('Invalid user ID'))
    }

    runQuery((db) => {
      db.collection('users').findOne({ _id: new ObjectId(userID) }, {
        projection: { email: 1, name: 1, userType: 1 }
      })
        .then(data => resolve(data))
        .catch(err => { debug('Error retrieving user', err); return reject(err) })
    })
  })
}

export function getInfoFromEmail (userEmail) {
  // Only include basic info
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('users').findOne({ email: userEmail }, {
        collation: { locale: 'en', strength: 2 },
        projection: { email: 1, name: 1, userType: 1 }
      })
        .then(data => resolve(data))
        .catch(err => { debug('Error retrieving user by email', err); return reject(err) })
    })
  })
}

export function emailExists (email) {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('users').findOne({ email }, {
        collation: { locale: 'en', strength: 2 },
        projection: { _id: 1 }
      })
        .then(data => (data == null) ? resolve(-1) : resolve(data))
        .catch(err => { debug('Error checking if email exists', err); return reject(err) })
    })
  })
}

/**
 * Validate user credentials
 * tested in test 1 in test.js
 * @param {string} email The email of the user in the database
 * @param {string} plainPassword Plaintext password
 * @return {Promise} Resolves to object with basic user info, rejects if invalid
 */
export function validateUser (email, password) {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('users').findOne({ email }, {
        collation: { locale: 'en', strength: 2 },
        projection: { meta: 0 }
      })
        .then((result) => {
          // Hash and validate the password (it is stored hashed)
          bcrypt.compare(password, result.passwordHash, (error, valid) => {
            // Check if an error occurred
            if (error) {
              debug('Error hashing password')
              debug(error)
              return reject(error)
            }

            // Was the password valid
            if (!valid) {
              debug('Password failed hash check')
              return reject(new Error('Invalid email or password'))
            }

            // Sanitize and return userInfo
            return resolve({
              id: result._id,
              email: result.email,
              name: result.name,
              userType: result.userType
            })
          })
        })
        .catch((err) => { debug('Error validating credentials', err); return reject(err) })
    })
  })
}

/**
 * Create a new user in the database
 * tested in test 3 of test.js
 * @param {string} name Full real name of the user to create
 * @param {string} email email of the user to create (CHECK FOR CASE-INSENSITIVE UNIQUENESS BEFORE CALLING)
 * @param {string} password Plaintext password
 * @param {string} userType User account type ('standard', 'manager', or 'admin'), default to standard
 * @return {Promise} Rejects on failure, resolves to the newly created ID on success
 */
export function createUser (name, email, password, userType = 'standard') {
  return new Promise((resolve, reject) => {
    // Hash password
    bcrypt.hash(password, SALT_ROUNDS, (err, passwordHash) => {
      // Check if an error occurred
      if (err) {
        debug('Failed to hash password')
        debug(err)
        return reject(err)
      }

      // Make new user data entry
      runQuery((db) => {
        db.collection('users').insertOne({
          name,
          email,
          passwordHash,
          userType
        })
          .then((result) => resolve(result.insertedId))
          .catch((error) => {
            debug('Failed to insert new user')
            debug(error)
            return reject(error)
          })
      })
    })
  })
}

/**
 * Update an existing user's password
 *
 * @param {string} userID Database id for the user to update password
 * @param {string} token The token generated during the reset request (must match one stored in DB)
 * @param {string} password Plaintext password
 * @return {Promise} Rejects on errors, resolves to true or false depending on result
 */
export function updatePassword (userID, token, password) {
  return new Promise((resolve, reject) => {
    // First lookup user details
    runQuery((db) => {
      db.collection('users').findOne(
        { _id: new ObjectId(userID) }
      ).then((userInfo) => {
        // Check that the token matches and is the right type
        if (userInfo?.lastEmail?.token !== token || userInfo?.lastEmail?.type !== 'recovery') {
          debug('Tokens do not match')
          return resolve(false)
        }

        // Hash password and update
        bcrypt.hash(password, SALT_ROUNDS, (err, passwordHash) => {
          // Check if an error occurred
          if (err) {
            debug('Failed to hash password')
            debug(err)
            return reject(err)
          }

          // Setup new password and clear token so it can't be reused
          const newData = { passwordHash }
          const unsetData = {}
          unsetData['lastEmail.token'] = ''
          unsetData['lastEmail.type'] = ''

          // Update the password and clear the token
          db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(userID) },
            { $set: newData, $unset: unsetData }
          ).then(result => resolve(true))
            .catch(error => { debug('Failed to update user', error); return reject(error) })
        })
      })
    })
  })
}

/**
 * Validate a user's email address
 *
 * @param {string} userID Database id for the user to validate
 * @param {string} token The token sent in the validation email (must match one stored in DB)
 * @return {Promise} Rejects on errors, resolves to true or false depending on result
 */
export function validateEmail (userID, token, password) {
  return new Promise((resolve, reject) => {
    // First lookup user details
    runQuery((db) => {
      db.collection('users').findOne(
        { _id: new ObjectId(userID) }
      ).then((userInfo) => {
        // Check that the token matches and is the right type
        if (userInfo?.lastEmail?.token !== token || userInfo?.lastEmail?.type !== 'verify') {
          debug('Tokens do not match')
          return resolve(false)
        }

        // Setup new password and clear token so it can't be reused
        const newData = { emailVerified: true }
        const unsetData = {}
        unsetData['lastEmail.token'] = ''
        unsetData['lastEmail.type'] = ''

        // Update email verification and clear token
        db.collection('users').findOneAndUpdate(
          { _id: new ObjectId(userID) },
          { $set: newData, $unset: unsetData }
        ).then(result => resolve(true))
          .catch(error => { debug('Failed to verify email', error); return reject(error) })
      })
        .catch((err) => { debug('Failed to verify email', err); return reject(err) })
    })
  })
}

export function updateUser (userID, newData) {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('users')
        .findOneAndUpdate(
          { _id: new ObjectId(userID) },
          { $set: { ...newData } },
          (err, result) => {
            if (err) {
              debug('Failed to update user')
              debug(err)
              return reject(err)
            }
            resolve()
          }
        )
    })
  })
}

export function removeUser (userID) {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('users')
        .findOneAndDelete({ _id: new ObjectId(userID) })
        .then(result => { resolve() })
        .catch(error => {
          debug('Failed to remove user')
          debug(error)
          return reject(error)
        })
    })
  })
}
