// Basic library imports
import fs from 'fs'
import path from 'path'

// Bring in objects to test
import Election from '../shared/Election.js'

// Setup the chai assertion library
import { expect } from 'chai'

// Test the Election class
describe('Test Election Object', () => {
  // Read in raw test data from JSON
  const rawData = fs.readFileSync(path.resolve('./test/data/testElections.json'), { encoding: 'utf-8' })
  let testData = JSON.parse(rawData)

  // Parse the raw test data to Election objects
  describe('Parse raw election data', function () {
    // Valid data read from a file
    it('Creates Election objects from raw JSON data', function () {
      expect(() => {
        testData = testData.map((rawElection) => {
          const newElection = new Election(rawElection)
          expect(newElection).to.have.all.keys('id', 'name', 'description', 'startDate', 'endDate', 'poolID', 'EIN')
          return newElection
        })
      }).to.not.throw()
    })
  })
})
