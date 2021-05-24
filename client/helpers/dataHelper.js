import Axios from 'axios'

// Generic functions for all types
export function getList (type) {
  return new Promise((resolve, reject) => {
    Axios.get(`${type}/`)
      .then((result) => { resolve(result.data) })
      .catch((error) => { reject(error) })
  })
}

export function getItem (type, itemID) {
  return new Promise((resolve, reject) => {
    Axios.get(`${type}/${itemID}`)
      .then((result) => { resolve(result.data) })
      .catch((error) => { reject(error) })
  })
}

export function getItems (type, itemIDs) {
  return new Promise((resolve, reject) => {
    Axios.post(`${type}/`, itemIDs, { headers: { 'Content-Type': 'application/json' } })
      .then((result) => { resolve(result.data) })
      .catch((error) => { reject(error) })
  })
}

export function newItem (type, itemData) {
  return new Promise((resolve, reject) => {
    Axios.put(`${type}/create`, itemData)
      .then((result) => { resolve(result.data) })
      .catch((error) => { reject(error) })
  })
}

export function updateItem (type, itemID, itemData) {
  return new Promise((resolve, reject) => {
    Axios.post(`${type}/${itemID}/update`, itemData)
      .then((result) => { resolve(result.status) })
      .catch((error) => { reject(error) })
  })
}

// Specialized functions for specific types
export function generateEINs (electionID) {
  return new Promise((resolve, reject) => {
    Axios.post('election/generateEIN', { id: electionID })
      .then((result) => { resolve(result.data.EIN) })
      .catch((error) => { reject(error) })
  })
}
