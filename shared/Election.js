import Debug from 'debug'
import moment from 'moment'

const debug = Debug('server:Election')

class Election {
  constructor ({ id, name, description, startDate, endDate, poolID, EID }) {
    if (id === undefined) {
      debug('id cannot be undefined for a new Election')
      throw new Error('id cannot be undefined for a new Election')
    }

    if (poolID === undefined) {
      debug('poolID cannot be undefined for a new Election')
      throw new Error('poolID cannot be undefined for a new Election')
    }

    this.id = id
    this.poolID = poolID

    this.startDate = startDate || moment()
    this.endDate = endDate || moment()

    this.name = name || ''
    this.description = description || ''
    this.EID = EID || []
  }

  stringify () {
    return JSON.stringify(this)
  }

  static parse (JSONString) {
    try {
      const newElection = JSON.parse(JSONString)
      return new Election(newElection)
    } catch (err) {
      debug('Failed to parse Election info: ' + err)
    }
  }
}

export default Election
