import Debug from 'debug'
const debug = Debug('server:Voter')

class Voter {
  constructor (param) {
    // Handle name-email string parsing
    if (typeof param === 'string') {
      param = Voter.parseEmailString(param)
    }

    // Ignore anything that's not an object
    if (typeof param !== 'object') {
      throw new Error('Unknown parameter type provided to Voter constructor')
    }

    // Check for required parameters
    if (!param.firstName || !param.email) {
      throw new Error('First name and email are required for a Voter')
    }

    // Extract data
    const { firstName, lastName, email, id, _id } = param
    this.firstName = firstName || ''
    this.lastName = lastName || ''
    this.email = email || ''
    this.id = _id || id || '*'
  }

  toString () {
    return `${this.lastName}, ${this.firstName} <${this.email}>`
  }

  stringify () {
    return JSON.stringify(this)
  }

  static parse (JSONString) {
    try {
      let newVoters = JSON.parse(JSONString)
      if (!Array.isArray(newVoters)) {
        newVoters = [newVoters]
      }
      const parsedVoters = newVoters.map((newVoter) => (new Voter(newVoter)))
      if (parsedVoters.length === 1) { return parsedVoters[0] }
      return parsedVoters
    } catch (err) {
      debug('Failed to parse Voter info: ' + err)
    }
  }

  static parseEmailString (emailString) {
    // Split out name and email
    const matches = emailString.match(/(?<name>.*)<(?<email>.*)>/)
    if (matches === null) {
      throw new Error('Failed to parse name and email string for voter.')
    }
    const rawName = matches.groups.name?.trim()
    const rawEmail = matches.groups.email?.trim()

    // Separate name into parts
    if (rawName.includes(',')) {
      const names = rawName.split(',').map((name) => (name.trim()))
      return new Voter({
        firstName: names[1],
        lastName: names[0],
        email: rawEmail
      })
    } else {
      const names = rawName.split(' ').map((name) => (name.trim()))
      const lastName = names.pop()
      return new Voter({
        firstName: names.join(' '),
        lastName: lastName,
        email: rawEmail
      })
    }
  }
}

export default Voter
