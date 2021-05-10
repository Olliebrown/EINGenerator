import fs from 'fs'
import Axios from 'axios'
import moment from 'moment'

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
    Axios.get('https://randomuser.me/api/?results=10')
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

async function makePool (id, name, description, howMany) {
  const members = await getPeople(howMany)
  return {
    id, name, description, members
  }
}

async function makeTestPoolData (howMany, idOffset = 0, peopleMin = 10, peopleMax = 30) {
  const poolList = []
  for (let poolNum = 1; poolNum <= howMany; poolNum++) {
    const newPool = await makePool(
      poolNum + idOffset,
      `testPool${poolNum}`,
      `Test voting pool number ${poolNum}`,
      getRandomInt(peopleMin, peopleMax)
    )
    poolList.push(newPool)
  }

  return poolList
}

function makeTestElectionData (poolData, howMany, idOffset, minDate, maxDate) {
  const electionList = []
  for (let electionNum = 1; electionNum <= howMany; electionNum++) {
    const date1 = randomDate(minDate, maxDate)
    const date2 = randomDate(minDate, maxDate)
    const poolIndex = getRandomInt(0, poolData.length)
    const newElection = {
      id: electionNum + idOffset,
      name: `testElection${electionNum}`,
      description: `Test election number ${electionNum}`,
      startDate: (date1 < date2 ? date1 : date2),
      endDate: (date1 < date2 ? date2 : date1),
      poolID: poolData[poolIndex].id
    }
    electionList.push(newElection)
  }
  return electionList
}

async function main () {
  const poolData = await makeTestPoolData(20, 9000)
  const electionData = makeTestElectionData(poolData, 10, 9000, moment('1820-01-01T00:00:00'), moment('1821-01-01T00:00:00'))
  fs.writeFileSync('./server/data/generator/testPools.json', JSON.stringify(poolData, null, 2), { encoding: 'utf8' })
  fs.writeFileSync('./server/data/generator/testElections.json', JSON.stringify(electionData, null, 2), { encoding: 'utf8' })
}
main()
