import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import moment from 'moment'

import { makeStyles } from '@material-ui/core/styles'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Skeleton from '@material-ui/lab/Skeleton'

import * as DATA from '../helpers/dataHelper.js'
import PersonList from './PersonList.jsx'

// String for formatting dates with moment.js
const FMT_STRING = ' MMMM Do YYYY, h:mm:ss a '

const useStyles = makeStyles((theme) => ({
  dateStyle: {
    fontWeight: 'bold'
  }
}))

export default function ItemViewDetails (props) {
  // Generate unique class names
  const classes = useStyles()

  // Track item id of expanded panel and expanded state
  const [itemDetails, setItemDetails] = useState(null)

  // Function to asynchronously retrieve details
  const retrieveDetails = async () => {
    if (props.type === 'none' || props.itemID === '') {
      console.error(`Cannot retrieve details for "${props.type}" "${props.itemID}"`)
      return
    }

    // Try to retrieve data
    try {
      console.log(`Retrieve details ${props.type} ${props.itemID}`)
      const newDetails = await DATA.getItem(props.type, props.itemID)
      setItemDetails(newDetails)
    } catch (err) {
      console.error(`Failed to retrieve "${props.type}" type details for ${props.itemID}`)
      console.error(err)
      alert(`WARNING: Failed to retrieve ${props.type} details (see console)`)
    }
  }

  useEffect(() => { retrieveDetails() }, [])

  // Show skeleton while loading
  if (itemDetails === null) {
    return (
      <AccordionDetails>
        <Skeleton width='100%' height={props.type === 'pool' ? 500 : 50} variant='rect' animation='wave' />
      </AccordionDetails>
    )
  }

  // Show full details once available
  return (
    <AccordionDetails>
      <Grid container spacing={1}>
        <Grid item sm={12}>
          <Typography variant='body1'>{itemDetails.description}</Typography>
        </Grid>
        <Grid item sm={12}>
          {(props.type === 'pool' &&
            <PersonList people={itemDetails.members} />
          )}
          {(props.type === 'election' &&
            <Typography>
              Runs from
              <span className={classes.dateStyle}>
                {moment(itemDetails.startDate).format(FMT_STRING)}
              </span> to
              <span className={classes.dateStyle}>
                {moment(itemDetails.endDate).format(FMT_STRING)}
              </span>
            </Typography>
          )}
        </Grid>
      </Grid>
    </AccordionDetails>
  )
}

ItemViewDetails.propTypes = {
  type: PropTypes.string,
  itemID: PropTypes.string
}

ItemViewDetails.defaultProps = {
  type: 'none',
  itemID: ''
}
