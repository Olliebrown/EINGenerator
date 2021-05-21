import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'

import Avatar from '@material-ui/core/Avatar'
import ImageIcon from '@material-ui/icons/Person'

import * as DATA from '../helpers/dataHelper.js'
import debug from 'debug'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  }
}))

export default function PersonList (props) {
  // Destructure props and create class names
  const { people } = props
  const classes = useStyles()

  // Deal with empty list
  if (people.length < 1) {
    return (
      <div className={classes.root}>
        <Typography variant='body1'>
          {'(no members)'}
        </Typography>
      </div>
    )
  }

  // Setup person data state
  const [peopleData, updatePeopleData] = useState([])
  useEffect(async () => {
    if (people.length > 1) {
      try {
        const newData = await DATA.getItem('voters', people)
        updatePeopleData(newData)
      } catch (err) {
        console.error('Failed to retrieve voters')
        console.error(err)
      }
    }
  }, [people])

  // Render list of people
  return (
    <List className={classes.root}>
      {
        peopleData.length < 1 &&
          <Typography variant='body1'>
            {'Retrieving data ...'}
          </Typography>
      }
      {
        peopleData.length >= 1 &&
        peopleData.map((person, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar>
                <ImageIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={`${person.firstName} ${person.lastName}`} secondary={person.email} />
          </ListItem>
        ))
      }
    </List>
  )
}

PersonList.propTypes = {
  people: PropTypes.arrayOf(
    PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string
    })
  )
}

PersonList.defaultProps = {
  people: []
}
