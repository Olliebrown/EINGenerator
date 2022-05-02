import Express from 'express'
import Debug from 'debug'

import VoterRouter from './api/voterRouter.js'
import PoolRouter from './api/poolRouter.js'
import ElectionRouter from './api/electionRouter.js'
import EmailServiceRouter from './api/emailServiceRouter.js'
import authorizationRouter from './api/authorizationRouter.js'

const debug = Debug('server:main')
const app = new Express()

// Log all requests
app.use((req, res, next) => {
  debug(`${req.method}: ${req.url}`)
  next()
})

// Backend data API
app.use('/voter', VoterRouter)
app.use('/pool', PoolRouter)
app.use('/election', ElectionRouter)

// Backend service API
app.use('/email', EmailServiceRouter)
app.use('/auth', authorizationRouter)

// Statically served files
app.use('/', Express.static('./public'))

// Start listening for requests
app.listen(process.env.PORT || 3000, () => {
  debug(`Express listening on port ${process.env.PORT || 3000}`)
})
