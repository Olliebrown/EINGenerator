import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import TextField from '@material-ui/core/TextField'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import Grid from '@material-ui/core/Grid'
import { Typography } from '@material-ui/core'

import DialogForm from './DialogForm.jsx'

import * as DATA from '../helpers/dataHelper.js'
import Pool from '../../shared/Pool.js'
import Voter from '../../shared/Voter.js'

const useStyles = makeStyles((theme) => ({
  instructions: {
    color: 'grey'
  }
}))

export default function PoolForm (props) {
  // Destructure props
  const { modalOpen, onModalToggle, refreshData } = props

  // Generate style class names
  const classes = useStyles()

  // Form state for managed inputs
  const [poolName, updatePoolName] = useState('')
  const [poolDescription, updatePoolDescription] = useState('')
  const [rawVoterList, updateRawVoterList] = useState('')

  // Form field error states
  const [nameError, updateNameError] = useState(false)
  const [voterListError, updateVoterListError] = useState(' ')

  // Handle form submission
  const formSubmitted = async () => {
    let isReady = true

    // Check the pool name
    if (poolName === '') {
      updateNameError(true)
      isReady = false
    }

    // Process the raw voter list data
    let members = null
    if (rawVoterList === '') {
      updateVoterListError('Must provide at least 1 voter')
      isReady = false
    } else {
      members = rawVoterList.split(/\r?\n/g)
      try {
        members = members.map((item) => (Voter.parseEmailString(item)))
      } catch (err) {
        updateVoterListError('Format Invalid')
        isReady = false
      }
    }

    // Stop if invalid
    if (!isReady) throw false

    // Attempt to create new voters
    try {
      for (let i = 0; i < members.length; i++) {
        const response = await DATA.newItem('voter', members[i])
        members[i] = response.id
      }
    } catch (err) {
      alert('Error creating voter')
      console.error(err)
    }

    console.log(members)

    // Attempt to create a pool object
    const newPool = new Pool({
      id: '*',
      name: poolName,
      description: poolDescription,
      members
    })

    console.log(newPool)

    // Attempt to insert the pool object
    try {
      await DATA.newItem('pool', newPool)
      if (refreshData) {
        refreshData()
      }
    } catch (err) {
      alert('Error creating voter pool')
      console.error(err)
    }
  }

  // Draw as dialog content (it must be a child of the DialogForm Component)
  return (
    <DialogForm
      addLabel="Create Voter Pool"
      onToggle={onModalToggle}
      open={modalOpen}
      onFormSubmit={formSubmitted}
      title="Add New Voter Pool"
      type="pool"
    >
      <DialogContent>
        <DialogContentText>
          {'To create a new voter pool, please enter the information below.'}
        </DialogContentText>
        <form noValidate autoComplete="off">
          <Grid container spacing={3}>
            <Grid item sm={12}>
              <TextField
                margin="dense"
                id="poolName"
                label="Voter Pool Name"
                type="text"
                variant="outlined"
                helperText={nameError ? 'Name cannot be blank' : ' '}
                error={nameError}
                fullWidth
                value={poolName}
                onChange={(e) => { updatePoolName(e.target.value) }}
                onBlur={() => { updateNameError(false) }}
              />
            </Grid>
            <Grid item sm={12}>
              <TextField
                margin="dense"
                id="poolDescription"
                label="Pool Description"
                type="text"
                variant="outlined"
                fullWidth
                value={poolDescription}
                onChange={(e) => { updatePoolDescription(e.target.value) }}
              />
            </Grid>
            <Grid item sm={12}>
              <TextField
                id="poolVotersList"
                label="Voter Info"
                multiline
                rows={8}
                variant="outlined"
                helperText={voterListError}
                error={voterListError !== ' '}
                fullWidth
                value={rawVoterList}
                onChange={(e) => { updateRawVoterList(e.target.value) }}
                onBlur={() => { updateVoterListError(' ') }}
              />
            </Grid>
            <Grid item sm={12}>
              <Typography variant="subtitle1" className={classes.instructions}>
                {'Please enter ONE voter per line'}
                <br />
                {'Enter in the form: '}
                <code>
                  {'lastName, firstName &lt;email&gt;'}
                </code>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </DialogForm>
  )
}

PoolForm.propTypes = {
  modalOpen: PropTypes.bool.isRequired,
  onModalToggle: PropTypes.func.isRequired,
  refreshData: PropTypes.func
}

PoolForm.defaultProps = {
  refreshData: null
}
