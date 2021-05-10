import React, { useState } from 'react'
import PropTypes from 'prop-types'

import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import Grid from '@material-ui/core/Grid'

import moment from 'moment'

import DialogForm from './DialogForm.jsx'

import * as DATA from '../helpers/dataHelper.js'
import Election from '../../shared/Election.js'

export default function ElectionForm (props) {
  // State for managed form inputs
  const [electionName, updateElectionName] = useState('')
  const [electionDescription, updateElectionDescription] = useState('')
  const [startDate, updateStartDate] = useState(moment())
  const [endDate, updateEndDate] = useState(moment())
  const [electionPool, updateElectionPool] = useState('')

  // Form field error states
  const [nameError, updateNameError] = useState(false)
  const [endDateError, updateEndDateError] = useState(' ')

  // Handle form submission
  const formSubmitted = async () => {
    let isReady = true

    // Check the pool name
    if (electionName === '') {
      updateNameError(true)
      isReady = false
    }

    // Process the raw voter list data
    if (!startDate.isSameOrBefore(endDate)) {
      updateEndDateError('End Date must be after start')
      isReady = false
    }

    // Stop if invalid
    if (!isReady) throw false

    // Attempt to insert the pool object
    await DATA.newItem('election', {
      name: electionName,
      description: electionDescription,
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      poolID: electionPool
    })
    if (props.refreshData) {
      props.refreshData()
    }
  }

  return (
    <DialogForm
      addLabel="Create Election"
      onToggle={props.onModalToggle}
      open={props.modalOpen}
      onFormSubmit={formSubmitted}
      title="Add New Election"
      type="election">

      <DialogContent>
        <DialogContentText>
          To create a new Election, please enter the information below.
        </DialogContentText>
        <form noValidate autoComplete="off">
          <Grid container spacing={3}>
            <Grid item sm={12}>
              <TextField
                margin="dense"
                id="electionName"
                label="Election Name"
                type="text"
                variant="outlined"
                helperText={nameError?'Name cannot be blank':' '}
                error={nameError}
                fullWidth
                value={electionName}
                onChange={(e) => { updateElectionName(e.target.value) }}
                onBlur={() => { updateNameError(false) }}
              />
            </Grid>
            <Grid item sm={12}>
              <TextField
                margin="dense"
                id="electionDescription"
                label="Election Description"
                type="text"
                variant="outlined"
                fullWidth
                value={electionDescription}
                onChange={(e) => { updateElectionDescription(e.target.value) }}
              />
            </Grid>
            <Grid item sm={6}>
              <TextField
                margin="dense"
                id="electionStartDate"
                label="Start Date"
                type="datetime-local"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={startDate.format('yyyy-MM-DDThh:mm')}
                onChange={(e) => { updateStartDate(moment(e.target.value)) }}
              />
            </Grid>
            <Grid item sm={6}>
              <TextField
                margin="dense"
                id="electionEndDate"
                label="End Date"
                type="datetime-local"
                variant="outlined"
                helperText={endDateError}
                error={endDateError !== ' '}
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={endDate.format('yyyy-MM-DDThh:mm')}
                onChange={(e) => { updateEndDate(moment(e.target.value)) }}
                onBlur={() => { updateEndDateError(' ') }}
              />
            </Grid>
            <Grid item sm={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="poolSelectLabel">Voter Pool</InputLabel>
                <Select
                  labelId="poolSelectLabel"
                  id="poolSelect"
                  value={electionPool}
                  onChange={(e) => { updateElectionPool(e.target.value) }}
                  label="Voter Pool"
                >
                  { props.voterPools.map((pool) => (
                    <MenuItem key={pool._id} value={pool._id}>{pool.name}</MenuItem>
                  )) }
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </DialogForm>
  )
}

ElectionForm.propTypes = {
  modalOpen: PropTypes.bool.isRequired,
  onModalToggle: PropTypes.func.isRequired,
  refreshData: PropTypes.func,
  voterPools: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string
    })
  )
}

ElectionForm.defaultProps = {
  voterPools: []
}
