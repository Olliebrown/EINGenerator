// React basics
import React from 'react'
import ReactDOM from 'react-dom'

// For use of date-time pickers
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'

// Our main app
import EINGeneratorApp from './components/EINGeneratorApp.jsx'

ReactDOM.render(
  <MuiPickersUtilsProvider utils={MomentUtils}>
    <EINGeneratorApp />
  </MuiPickersUtilsProvider>,
  document.getElementById('root')
)
