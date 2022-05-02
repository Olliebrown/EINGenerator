import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import Chip from '@material-ui/core/Chip'
import Paper from '@material-ui/core/Paper'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: theme.spacing(0.5),
    margin: 0
  },
  chip: {
    margin: theme.spacing(0.5)
  }
}))

export default function ElectionStatus (props) {
  const { status } = props
  const classes = useStyles()

  const dataList = [
    { label: `${status.responses.length} Responses`, color: 'primary' },
    { label: `${status.remaining.length} Remaining`, color: 'secondary' },
    { label: `${status.duplicates} Duplicates` },
    { label: `${status.unknowns} Unknowns` }
  ]

  return (
    <Paper elevation={0} component="ul" className={classes.root}>
      {dataList.map((data) => (
        <li key={data.label}>
          <Chip
            label={data.label}
            color={data.color || 'default'}
            className={classes.chip}
          />
        </li>
      ))}
    </Paper>
  )
}

ElectionStatus.propTypes = {
  status: PropTypes.shape({
    responses: PropTypes.arrayOf(PropTypes.string),
    remaining: PropTypes.arrayOf(PropTypes.string),
    duplicates: PropTypes.number,
    unknowns: PropTypes.number
  }).isRequired
}
