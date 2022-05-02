// React basics
import React from 'react'
import ReactDOM from 'react-dom'

// Initialize the google APIs and import the interface
import { authEmitter } from './helpers/googleAPIHelper.js'

// For use of date-time pickers
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'

// Our main app
import EINGeneratorApp from './components/EINGeneratorApp.jsx'

ReactDOM.render(
  <MuiPickersUtilsProvider utils={MomentUtils}>
    <EINGeneratorApp authEmitter={authEmitter} />
  </MuiPickersUtilsProvider>,
  document.getElementById('root')
)
