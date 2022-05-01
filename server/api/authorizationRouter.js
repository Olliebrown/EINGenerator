import Express from 'express'
import Debug from 'debug'

const debug = Debug('server:authorizationRouter')
const router = new Express.Router()

router.get('/redirect/:authCode?', (req, res) => {
  const authCode = req.params.authCode
  debug('Authorization received:', authCode)
  res.send('You have been authorized with code: ' + authCode)
})

export default router
