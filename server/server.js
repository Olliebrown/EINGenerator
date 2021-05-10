import Express from 'express'
import Debug from 'debug'

import PoolRouter from './api/poolRouter.js'
import ElectionRouter from './api/electionRouter.js'

const debug = Debug('server:main')
const app = new Express()

// Log all requests
app.use((req, res, next) => {
  debug(`${req.method}: ${req.url}`)
  next()
})

// Backend data API
app.use('/pool', PoolRouter)
app.use('/election', ElectionRouter)

// Statically served files
app.use('/', Express.static('./public'))

// Start listening for requests
app.listen(3000, () => {
  debug('Express listening on port 3000')
})
