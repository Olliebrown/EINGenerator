// Bring in basic libraries
import path from 'path'
import fs from 'fs'

// Bring in objects to test
import Voter from '../shared/Voter.js'

// Setup the chai assertion library
import { expect } from 'chai'

// Test the Voter class
describe('Voter Object Tests', () => {
  // Read in raw test data from JSON
  const rawData = fs.readFileSync(path.resolve('./test/data/testVoters.json'), { encoding: 'utf-8' })
  let testData = JSON.parse(rawData)

  // Parse the raw test data to Voter objects
  describe('Parse raw voter data', function () {
    // Valid data read from a file
    it('Creates Voter objects from raw JSON data', function () {
      expect(() => {
        testData = testData.map((rawVoter) => {
          const newVoter = new Voter(rawVoter)
          expect(newVoter).to.have.all.keys('id', 'firstName', 'lastName', 'email')
          return newVoter
        })
      }).to.not.throw()
    })
  })

  // Make some Voter's manually (both invalid and valid ones)
  describe('Manually Construct Voters', function () {
    // The voter object we expect in all the following tests
    const expectedVoter = {
      firstName: 'Joe Schwing',
      lastName: 'Schmo',
      email: 'joe.schmo@test.com',
      id: '*'
    }

    // Parsable emails
    it('Parses valid names-email strings into Voter objects', function () {
      [
        'Joe Schwing Schmo <joe.schmo@test.com>',
        'Schmo, Joe Schwing <joe.schmo@test.com>',
        'Schmo,Joe Schwing <joe.schmo@test.com>',
        'Joe Schwing Schmo<joe.schmo@test.com>',
        'Schmo, Joe Schwing<joe.schmo@test.com>',
        'Schmo,Joe Schwing<joe.schmo@test.com>',
        '  Joe Schwing Schmo <joe.schmo@test.com>  ',
        '  Schmo, Joe Schwing <joe.schmo@test.com>  ',
        '  Schmo,Joe Schwing <joe.schmo@test.com>  ',
        '  Joe Schwing Schmo<joe.schmo@test.com>  ',
        '  Schmo, Joe Schwing<joe.schmo@test.com>  ',
        '  Schmo,Joe Schwing<joe.schmo@test.com>  '
      ].forEach((nameEmailString) => {
        expect(() => {
          expect(new Voter(nameEmailString))
            .to.include(expectedVoter)
        }).to.not.throw()
      })
    })

    // Not Parsable emails
    it('Throws an error while attempting to parse invalid input', function () {
      [
        // It expects a string or object with 'firstName' and 'email'
        42.25,
        90999,
        true,
        new Uint16Array(),

        // Test all nullish values
        false,
        null,
        undefined,
        '',
        [],
        {},

        // Test various invalid name-email strings
        'Joe Schwing Schmo joe.schmo@test.com', // Email must be surrounded by <>
        'Joe Schwing Schmo [joe.schmo@test.com]', // Email must be surrounded by <>
        'Joe Schwing Schmo (joe.schmo@test.com)', // Email must be surrounded by <>
        'Joe Schwing Schmo {joe.schmo@test.com}', // Email must be surrounded by <>
        '<joe.schmo@test.com>', // First name cannot be empty
        'joe.schmo@test.com', // Email must be surrounded by <> and first name cannot be empty
        'Joe Schwing Schmo', // Email cannot be empty
        'Joe Schwing Schmo <>' // Email cannot be empty
      ].forEach((nameEmailString, i) => {
        expect(() => {
          const voter = new Voter(nameEmailString)
          console.log(`        ${i}: "${voter}"`)
        }).to.throw()
      })
    })
  })
})
