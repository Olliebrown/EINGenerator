// Bring in objects to test
import EIN from '../shared/EIN.js'

// Setup the chai assertion library
import chai, { expect } from 'chai'
import chaiMatch from 'chai-match'
chai.use(chaiMatch)

// String of '0' to '9' three times
const digitSTR = ('0123456789').repeat(3)

// common Test callback
const patternTest = (item) => {
  const div = Math.floor(EIN.digits(item) / 3)
  const rem = EIN.digits(item) % 3

  const X = div
  const Y = div + (rem >= 2 ? 1 : 0)
  const Z = div + (rem >= 1 ? 1 : 0)

  const pattern = `^\\d{${X}}-?\\d{${Y}}-?\\d{${Z}}$`
  expect(item.toString()).to.match(new RegExp(pattern))
}

// Test the EIN class
describe('EIN Object Tests', () => {
  // Making regular EINs
  describe('Generate Regular EINs', function () {
    // Make a bunch of EINs of various lengths as rotations of a standard string
    const tests = []
    for (let digits = 3; digits < 30; digits++) {
      let curStr = digitSTR.slice(-(digits))
      const curTests = []
      for (let i = 1; i <= digits; i++) {
        curTests.push(new EIN(curStr, digits))
        curStr = curStr.slice(-digits + 1) + curStr.slice(0, 1)
      }
      tests.push(curTests)
    }

    // Run pattern test for each EIN
    let A = '#'
    let B = '#'
    let C = '#'
    tests.forEach((subTest, i) => {
      // Compute progress indicator
      const progress = `${('0' + (i + 1)).slice(-2)}/${tests.length}`

      // Run test of pattern matching
      it(`generates regular EIN with the pattern ${A}-${B}-${C} (${progress})`, function () {
        subTest.forEach(patternTest)
      })

      // Advance the pattern parts
      switch (i % 3) {
        case 0: C = C + '#'; break
        case 1: B = B + '#'; break
        case 2: A = A + '#'; break
      }
    })
  })

  // Making random EINs
  describe('Generate Random EINs', function () {
    // Make a bunch of EINs of various lengths as random values
    const tests = []
    for (let digits = 3; digits < 30; digits++) {
      const curTests = EIN.generate(10, digits)
      tests.push(curTests)
    }

    // Run pattern test for each EIN
    let A = '#'
    let B = '#'
    let C = '#'
    tests.forEach((subTest, i) => {
      // Compute progress indicator
      const progress = `${('0' + (i + 1)).slice(-2)}/${tests.length}`

      // Run test of pattern matching
      it(`generates random EIN with the pattern ${A}-${B}-${C} (${progress})`, function () {
        subTest.forEach(patternTest)
      })

      // Advance the pattern parts
      switch (i % 3) {
        case 0: C = C + '#'; break
        case 1: B = B + '#'; break
        case 2: A = A + '#'; break
      }
    })
  })
})
