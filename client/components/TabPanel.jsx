import React from 'react'
import PropTypes from 'prop-types'

import Fade from '@material-ui/core/Fade'
import Box from '@material-ui/core/Box'

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    left: 0,
    right: 0
  }
}))

export default function TabPanel (props) {
  const classes = useStyles()
  const { children, value, index } = props

  return (
    <Fade
      in={value === index}
      role="tabpanel"
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      className={classes.root}
    >
      <Box p={3}>
        {children}
      </Box>
    </Fade>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
}

TabPanel.defaultProps = {
  children: null
}
