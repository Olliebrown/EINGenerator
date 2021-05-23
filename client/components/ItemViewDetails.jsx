import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import AccordionDetails from '@material-ui/core/AccordionDetails'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Skeleton from '@material-ui/lab/Skeleton'

import ElectionDetails from './ElectionDetails.jsx'
import PersonList from './PersonList.jsx'

import * as DATA from '../helpers/dataHelper.js'

export default function ItemViewDetails (props) {
  // Destructure props
  const { type, itemID } = props

  // Track item id of expanded panel and expanded state
  const [itemDetails, setItemDetails] = useState(null)

  // Function to asynchronously retrieve details
  const retrieveDetails = async () => {
    if (type === 'none' || itemID === '') {
      console.error(`Cannot retrieve details for "${type}" "${itemID}"`)
      return
    }

    // Try to retrieve data
    try {
      const newDetails = await DATA.getItem(type, itemID)
      setItemDetails(newDetails)
    } catch (err) {
      console.error(`Failed to retrieve "${type}" type details for ${itemID}`)
      console.error(err)
      alert(`WARNING: Failed to retrieve ${type} details (see console)`)
    }
  }

  useEffect(() => { retrieveDetails() }, [])

  // Show skeleton while loading
  if (itemDetails === null) {
    return (
      <AccordionDetails>
        <Skeleton width='100%' height={type === 'pool' ? 500 : 50} variant='rect' animation='wave' />
      </AccordionDetails>
    )
  }

  // Show full details once available
  return (
    <AccordionDetails>
      <Grid container spacing={1}>
        <Grid item sm={12}>
          <Typography variant='body1'>
            {itemDetails.description}
          </Typography>
        </Grid>
        {(type === 'pool' &&
          <Grid item sm={12}>
            <PersonList people={itemDetails.members} />
          </Grid>
        )}
        {(type === 'election' &&
          <ElectionDetails election={itemDetails} />
        )}
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
