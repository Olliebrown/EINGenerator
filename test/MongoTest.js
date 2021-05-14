// Basic library imports
import fs from 'fs'
import path from 'path'

// Bring in objects to test
import Voter from '../shared/Voter.js'
import Pool from '../shared/Pool.js'
import Election from '../shared/Election.js'

// Bring in mongo controllers
import * as MONGO_VOTER_CTRL from '../server/mongo/VoterController.js'
import * as MONGO_POOL_CTRL from '../server/mongo/PoolController.js'
import * as MONGO_ELECTION_CTRL from '../server/mongo/ElectionController.js'

// Setup the chai assertion library
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

// Read in raw voter test data from JSON
const rawVoterData = fs.readFileSync(path.resolve('./test/data/testVoters.json'), { encoding: 'utf-8' })
let testVoterData = JSON.parse(rawVoterData)
testVoterData = testVoterData.map((rawVoter) => (new Voter(rawVoter)))
const voterIDMap = {}

// Read in raw voter pool test data from JSON
const rawPoolData = fs.readFileSync(path.resolve('./test/data/testPools.json'), { encoding: 'utf-8' })
let testPoolData = JSON.parse(rawPoolData)
testPoolData = testPoolData.map((rawPool) => (new Pool(rawPool)))
const poolIDMap = {}

// Read in raw election test data from JSON
const rawElectionData = fs.readFileSync(path.resolve('./test/data/testElections.json'), { encoding: 'utf-8' })
let testElectionData = JSON.parse(rawElectionData)
testElectionData = testElectionData.map((rawElection) => (new Election(rawElection)))

// Test the MongoDB controllers (skipped for CI)
describe('Test MongoDB Controller', function () {
  // Skip this test when running in github CI
  if (process.env.GITHUB_ACTIONS) { return }

  // Build/rebuild the voters collection
  describe('Rebuild Voters Collection', function () {
    // Increase timeout to 30 seconds
    this.timeout(30000)

    // Clear old collection
    it('Drops the voters collection', function () {
      const dropPromise = MONGO_VOTER_CTRL.clearVoterList()
      expect(dropPromise).to.be.fulfilled
      return dropPromise
    })

    // Add data to DB 100 entries at a time
    const stepCount = Math.ceil(testVoterData.length / 100)
    for (let step = 0; step < stepCount; step++) {
      it(`Creates 100 documents in voter collection (${step+1} of ${stepCount})`, async function () {
        const start = step * 100
        const end = Math.min(start + 100, testVoterData.length)
        const newPromise = MONGO_VOTER_CTRL.addToVoterList(testVoterData.slice(start, end))
        expect(newPromise).to.be.fulfilled
        const newIDs = await newPromise
        Object.values(newIDs).forEach((newID, i) => {
          voterIDMap[testVoterData[start + i].id.toString()] = newID
        })
      })
    }
  })

  // Build/rebuild the pool collection
  describe('Rebuild Pool Collection', function () {
    // Increase timeout to 30 seconds
    this.timeout(30000)

    // Update Voter IDs
    it('Updates the pool voter IDs', function () {
      testPoolData.forEach((pool) => {
        pool.members = pool.members.map((memberID) => {
          return voterIDMap[memberID]
        })
      })
    })

    // Clear old collection
    it('Drops the pool collection', function () {
      const dropPromise = MONGO_POOL_CTRL.clearPoolList()
      expect(dropPromise).to.be.fulfilled
      return dropPromise
    })

    // Add data to DB 100 entries at a time
    const stepCount = Math.ceil(testPoolData.length / 100)
    for (let step = 0; step < stepCount; step++) {
      it(`Creates 100 documents in pool collection (${step+1} of ${stepCount})`, async function () {
        const start = step * 100
        const end = Math.min(start + 100, testPoolData.length)
        const newPromise = MONGO_POOL_CTRL.addToPoolList(testPoolData.slice(start, end))
        expect(newPromise).to.be.fulfilled

        const newIDs = await newPromise
        Object.values(newIDs).forEach((newID, i) => {
          poolIDMap[testPoolData[start + i].id.toString()] = newID
        })
      })
    }
  })

  // Build/rebuild the election collection
  describe('Rebuild Election Collection', function () {
    // Increase timeout to 30 seconds
    this.timeout(30000)

    // Update Voter and pool IDs
    it('Updates the election voter and pool IDs', function () {
      testElectionData.forEach((election) => {
        election.poolID = poolIDMap[election.poolID].toString()
        if (election.EIN) {
          const newEIN = {}
          Object.keys(election.EIN).forEach((oldID) => {
            newEIN[voterIDMap[oldID]] = election.EIN[oldID]
          })
          election.EIN = newEIN
        }
      })
    })

    // Clear old collection
    it('Drops the pool collection', function () {
      const dropPromise = MONGO_ELECTION_CTRL.clearElectionList()
      expect(dropPromise).to.be.fulfilled
      return dropPromise
    })

    // Add data to DB 100 entries at a time
    const stepCount = Math.ceil(testElectionData.length / 100)
    for (let step = 0; step < stepCount; step++) {
      it(`Creates 100 documents in election collection (${step+1} of ${stepCount})`, async function () {
        const start = step * 100
        const end = Math.min(start + 100, testElectionData.length)
        const newPromise = MONGO_ELECTION_CTRL.addToElectionList(testElectionData.slice(start, end))
        expect(newPromise).to.be.fulfilled
        await newPromise
      })
    }
  })  
})
