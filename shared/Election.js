import Debug from 'debug'
import moment from 'moment'

import EIN from './EIN.js'

const debug = Debug('server:Election')

class Election {
  constructor ({ _id, id, name, description, startDate, endDate, poolID, EIN, sheetURL }) {
    if (id === undefined && _id === undefined) {
      debug('id cannot be undefined for a new Election')
      throw new Error('id cannot be undefined for a new Election')
    }

    if (poolID === undefined) {
      debug('poolID cannot be undefined for a new Election')
      throw new Error('poolID cannot be undefined for a new Election')
    }

    this.id = _id || id
    this.poolID = poolID

    this.startDate = startDate || moment()
    this.endDate = endDate || moment()

    this.name = name || ''
    this.description = description || ''
    this.sheetURL = sheetURL || ''
    this.EIN = EIN || null
  }

  makeNewEINList (myPool, digits) {
    // Make raw array of random EIN values
    const rawEIN = EIN.generate(myPool.members.length, digits)

    // Build and store map from voter IDs to EIN array
    this.EIN = {}
    myPool.members.forEach((voterID, i) => {
      this.EIN[voterID] = [rawEIN[i].toString()]
    })
  }

  // Get array of current EIN without voter IDs (ignore any prior EIN)
  getCurrentEINList () {
    return Object.values(this.EIN).map((curEIN) => (curEIN[0].toString()))
  }

  // Make array of only the EIN values
  getAllEINList () {
    const allEIN = []
    this.EIN.forEach((curEIN) => {
      const itemArray = curEIN.map((item) => (item.toString()))
      allEIN.splice(allEIN.length, 0, ...itemArray)
    })
    return allEIN
  }

  // Replace the indicated voter's EIN (does not discard old EIN, only deactivates it)
  replaceEIN (voterID) {
    if (this.EIN[voterID] !== undefined) {
      const newEIN = EIN.randomEIN(EIN.digits(this.EIN[voterID]), this.getALLEinList())
      this.EIN[voterID].unshift(newEIN.toString())
      return newEIN
    }
  }

  stringify () {
    return JSON.stringify(this)
  }

  static parse (JSONString) {
    try {
      let newElections = JSON.parse(JSONString)
      if (!Array.isArray(newElections)) {
        newElections = [newElections]
      }
      const parsedElections = newElections.map((newElection) => (new Election(newElection)))
      if (parsedElections.length === 1) { return parsedElections[0] }
      return parsedElections
    } catch (err) {
      debug('Failed to parse Election info: ' + err)
    }
  }
}

export default Election
