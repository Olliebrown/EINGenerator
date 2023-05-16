import EventEmitter from 'eventemitter3'

// App credentials
const CLIENT_ID = '123613069140-mckniu7o56ceojoo5bdiajimhmr7nt5l.apps.googleusercontent.com'
const API_KEY = 'AIzaSyCN7LNiG07subhMqGevfmb4-UBEmmmDT7k'

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4'

// Authorization scopes required by the API
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/userinfo.profile'

// Event communication
export const authEmitter = new EventEmitter()
authEmitter.on('authorize', doAuthorization)
authEmitter.on('revoke', doSignOut)

// Local state
let tokenClient
let gapiInitialized = false
let gIsInitialized = false

/**
 * Callback after api.js is loaded.
 **/
window.gapiLoaded = () => {
  gapi.load('client', initializeGapiClient)
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 **/
async function initializeGapiClient () {
  // Initialize the Google API client
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC]
  })

  // Update initialization state
  gapiInitialized = true
  finalizeInitialization()
}

/**
 * Callback after Google Identity Services are loaded.
 **/
window.gIsLoaded = () => {
  // Initialize the google token client
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '' // defined later
  })

  // Update initialization state
  gIsInitialized = true
  finalizeInitialization()
}

/**
 * Check if all is loaded and emit a signal if it is
 **/
function finalizeInitialization () {
  if (gapiInitialized && gIsInitialized) {
    authEmitter.emit('initialized')
  }
}

/**
 * Sign in the user upon
 **/
export function doAuthorization (callback) {
  // Set the appropriate callback
  tokenClient.callback = (resp) => {
    if (resp.error !== undefined) {
      throw (resp)
    }

    authEmitter.emit('authorized')
    getUserInfo().then(console.log)
    if (callback) {
      callback()
    }
  }

  // Either prompt for consent to get token or use the one that exists
  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: 'consent' })
  } else {
    tokenClient.requestAccessToken({ prompt: '' })
  }
}

/**
 * Sign out the user
 */
export function doSignOut () {
  const token = gapi.client.getToken()
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token)
    gapi.client.setToken('')
  }
  authEmitter.emit('revoked')
}

/**
 * Get the signed in user's profile information (must be logged in first)
 * @returns {Promise} Resolves to the user's profile information
 */
export async function getUserInfo () {
  // Send request to standard userinfo endpoint
  const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: {
      Authorization: `Bearer ${gapi.client.getToken().access_token}`
    }
  })

  if (response.status >= 400) {
    throw new Error(`Failed to retrieve user info (status ${response.status})`)
  }

  // Parse the response to a json object
  const userData = await response.json()
  return userData
}
