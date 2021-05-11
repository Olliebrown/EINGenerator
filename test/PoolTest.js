// Bring in basic libraries
import path from 'path'
import fs from 'fs'

// Bring in objects to test
import Pool from '../shared/Pool.js'

// Setup the chai assertion library
import { expect } from 'chai'

// Test the Pool class
describe('Voter Pool Object Tests', () => {
  // Read in raw test data from JSON
  const rawData = fs.readFileSync(path.resolve('./test/data/testPools.json'), { encoding: 'utf-8' })
  let testData = JSON.parse(rawData)

  // Parse the raw test data to Voter Pool objects
  describe('Parse raw Voter Pool data', function () {
    // Valid data read from a file
    it('Creates Pool objects from raw JSON data', function () {
      expect(() => {
        testData = testData.map((rawPool) => {
          const newPool = new Pool(rawPool)
          expect(newPool).to.have.all.keys('id', 'name', 'description', 'members')
          return newPool
        })
      }).to.not.throw()
    })
  })

  // describe('Manually Construct Pools', function () {
  // })
})
