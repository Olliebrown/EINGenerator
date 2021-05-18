import Debug from 'debug'
const debug = Debug('server:Pool')

class Pool {
  constructor ({ id, _id, name, description, members }) {
    if (_id === undefined && id === undefined) {
      debug('id missing for new Pool')
      throw new Error('Pool requires an id')
    }

    this.id = _id || id
    this.name = name || ''
    this.description = description || ''

    if (!members || members === '') {
      this.members = []
    } else if (Array.isArray(members) && members.every(e => typeof e === 'string')) {
      this.members = [...members]
    } else {
      debug('invalid member array for new Pool')
      throw new Error('Pool member array should be an array of voter IDs')
    }
  }

  stringify () {
    return JSON.stringify(this)
  }

  static parse (JSONString) {
    try {
      let newPools = JSON.parse(JSONString)
      if (!Array.isArray(newPools)) {
        newPools = [newPools]
      }

      const parsedPools = newPools.map((newPool) => {
        if (!Array.isArray(newPool.members) || !newPool.members.every(e => typeof e === 'string')) {
          newPool.members = []
        }
        return new Pool(newPool)
      })

      if (parsedPools.length === 1) { return parsedPools[0] }
      return parsedPools
    } catch (err) {
      debug('Failed to parse Pool info: ' + err)
      throw err
    }
  }
}

export default Pool
