import Debug from 'debug'
import Voter from './Voter.js'

const debug = Debug('server:Pool')

class Pool {
  constructor ({ id, name, description, members }) {
    if (id === undefined) {
      debug('id missing for new Pool')
      throw new Error('Pool requires an id')
    }

    this.id = id
    this.name = name || ''
    this.description = description || ''

    if (!members || members === '') {
      this.members = []
    } else if (!Array.isArray(members)) {
      try {
        this.members = [new Voter(members)]
      } catch (err) {
        this.members = []
      }
    } else {
      this.members = members.map((voter) => {
        try {
          const newVoter = new Voter(voter)
          return newVoter
        } catch (err) {
          return null
        }
      })
      this.members = this.members.filter((voter) => (voter !== null))
    }
  }

  stringify () {
    return JSON.stringify(this)
  }

  static parse (JSONString) {
    try {
      const newPool = JSON.parse(JSONString)
      if (Array.isArray(newPool.members)) {
        newPool.members = newPool.members.map(
          (curMember) => {
            return new Voter(curMember)
          }
        )
      }
      return new Pool(newPool)
    } catch (err) {
      debug('Failed to parse Pool info: ' + err)
      throw err
    }
  }
}

export default Pool
