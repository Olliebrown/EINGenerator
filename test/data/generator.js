import fs from 'fs'
import Axios from 'axios'
import moment from 'moment'

import Voter from '../../../shared/Voter.js'
import Pool from '../../../shared/Pool.js'
import Election from '../../../shared/Election.js'

function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  if (min >= max) { return max }
  return Math.floor(Math.random() * (max - min) + min)
}

function randomDate (start, end) {
  return new Date(start._d.getTime() + Math.random() * (end._d.getTime() - start._d.getTime()))
}

function getPeople (howMany) {
  return new Promise((resolve, reject) => {
    Axios.get(`https://randomuser.me/api/?results=${howMany}`)
      .then((response) => {
        resolve(response.data.results.map(
          (person) => {
            return { firstName: person.name.first, lastName: person.name.last, email: person.email }
          }
        ))
      })
      .catch((err) => { reject(err) })
  })
}

async function makeTestVoterData (howMany, idOffset = 0) {
  const rawVoters = await getPeople(howMany)
  const voterList = rawVoters.map((voter, i) => {
    return new Voter({ id: '' + (idOffset + i + 1), ...voter })
  })
  return voterList
}

function makePool (id, name, description, voterCount, voterList) {
  // Get random list of voters without repeats
  const voterIndex = []
  do {
    const newIndex = Math.floor(Math.random() * voterList.length)
    if (!voterIndex.includes(newIndex)) {
      voterIndex.push(newIndex)
    }
  } while (voterIndex.length < voterCount)

  // Get member list and build pool
  const members = voterList.filter((_, i) => (voterIndex.includes(i)))
  return new Pool({ id, name, description, members: members.map((voter) => (voter.id)) })
}

function makeTestPoolData (voterList, howMany, idOffset = 0, peopleMin = 10, peopleMax = 30) {
  const poolList = []
  for (let poolNum = 1; poolNum <= howMany; poolNum++) {
    const newPool = makePool(
      '' + (poolNum + idOffset),
      `testPool${poolNum}`,
      `Test voting pool number ${poolNum}`,
      getRandomInt(peopleMin, peopleMax),
      voterList
    )
    poolList.push(newPool)
  }

  return poolList
}

function makeTestElectionData (poolData, howMany, idOffset, minDate, maxDate) {
  const electionList = []
  for (let electionNum = 1; electionNum <= howMany; electionNum++) {
    // Generate random dates in range
    const date1 = randomDate(minDate, maxDate)
    const date2 = randomDate(minDate, maxDate)

    // Pick a random pool
    const poolIndex = getRandomInt(0, poolData.length)

    // Make the election object
    const newElection = new Election({
      id: '' + (electionNum + idOffset),
      name: `testElection${electionNum}`,
      description: `Test election number ${electionNum}`,
      startDate: (date1 < date2 ? date1 : date2),
      endDate: (date1 < date2 ? date2 : date1),
      poolID: poolData[poolIndex].id
    })

    // 50% chance of generating EINs
    if (Math.random() > 0.5) {
      newElection.makeNewEINList(poolData[poolIndex])
    }

    // Add to the list
    electionList.push(new Election(newElection))
  }
  return electionList
}

async function main () {
  const voterData = await makeTestVoterData(2000, 5000)
  const poolData = makeTestPoolData(voterData, 1000, 8000, 10, 100)
  const electionData = makeTestElectionData(poolData, 200, 9000, moment('1820-01-01T00:00:00'), moment('1821-01-01T00:00:00'))

  fs.writeFileSync('./server/data/generator/testVoters.json', JSON.stringify(voterData, null, 2), { encoding: 'utf8' })
  fs.writeFileSync('./server/data/generator/testPools.json', JSON.stringify(poolData, null, 2), { encoding: 'utf8' })
  fs.writeFileSync('./server/data/generator/testElections.json', JSON.stringify(electionData, null, 2), { encoding: 'utf8' })
}
main()
