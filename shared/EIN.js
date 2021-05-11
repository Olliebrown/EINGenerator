class EIN {
  // Make a new EIN (accepts a number or string)
  constructor (val, digits) {
    // Digits only needed if val is a Number
    if (typeof val === 'number') {
      val = this.padStr(val, digits)
    } else if (typeof val !== 'string') {
      throw new Error('Only numbers or strings allowed when constructing an EIN')
    }

    // Is it already formatted?
    if (val.includes('-')) {
      this.val = val
    } else {
      // If not, format it first
      this.val = this.format(val)
    }
  }

  // Pad a string with leading zeros out to a certain width
  padStr (n, width, z) {
    z = z || '0'
    n = n + ''
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
  }

  format (val) {
    // How many digits per group (width)
    let W = Math.floor(val.length / 3)

    // How many left over (mod)
    const M = val.length % 3

    // Format into three groups of digits separated by dashes
    let str = val.replace(new RegExp(`^(\\d{${W}})`), '$1-')
    if (M === 2) { W++ }
    str = str.replace(new RegExp(`-(\\d{${W}})`), '-$1-')
    return str
  }

  toString () { return this.val }

  // Make list of random EIN values
  static generate (count, digits = 10) {
    if (typeof count !== 'number' || count < 1) {
      throw new Error(`Invalid EIN count passed to generator (${count}). Must be strictly positive number.`)
    }

    if (typeof digits !== 'number' || digits < Math.floor(Math.log10(count)) + 1) {
      throw new Error(`Invalid EIN digits passed to generator (${digits}). Must be number > log10(count) + 1.`)
    }

    const rawEIN = []
    do {
      const newEIN = EIN.randomEIN(digits, rawEIN)
      rawEIN.push(newEIN.toString())
    } while (rawEIN.length < count)
    return rawEIN.map((item) => (new EIN(item, digits)))
  }

  // Make a single random EIN value (not in the 'existing' list)
  static randomEIN (digits, existing = []) {
    let newEIN = ''
    do {
      for (let i = 0; i < digits; i++) {
        let digit = -1
        do { digit = Math.floor(Math.random() * 10) } while (digit >= 10)
        newEIN = newEIN + digit
      }
      newEIN = new EIN(newEIN)
    } while (existing.includes(newEIN.toString()))
    return newEIN
  }

  // Compute the 'digits' of an existing EIN
  static digits (val) { return val.toString().replace(/[^0-9]/g, '').length }
}

export default EIN
