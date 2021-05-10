import Debug from 'debug'
const debug = Debug('server:Voter')

class Voter {
  constructor (param) {
    // Handle string parameter
    if (typeof param === 'string') {
      param = Voter.parseEmailString(param)
    } else if (typeof param !== 'object') {
      throw new Error('Unknown parameter type provided to Voter constructor')
    }

    // Extract data
    const { firstName, lastName, email } = param
    this.firstName = firstName || ''
    this.lastName = lastName || ''
    this.email = email || ''
  }

  stringify () {
    return JSON.stringify(this)
  }

  static parse (JSONString) {
    try {
      const newVoter = JSON.parse(JSONString)
      return new Voter(newVoter)
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
