import Axios from 'axios'

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

export function newItem (type, itemData) {
  return new Promise((resolve, reject) => {
    Axios.put(`${type}/create`, itemData)
      .then((result) => { resolve(result.status) })
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
