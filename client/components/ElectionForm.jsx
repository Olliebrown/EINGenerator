import React, { useState, useEffect } from 'react'
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

export default function ElectionForm (props) {
  // Destructure props
  const { modalOpen, onModalToggle, refreshData, voterPools, itemData, isUpdate } = props

  // State for managed form inputs
  const [electionName, setElectionName] = useState('')
  const [electionDescription, setElectionDescription] = useState('')
  const [startDate, setStartDate] = useState(moment())
  const [endDate, setEndDate] = useState(moment())
  const [electionPool, setElectionPool] = useState('')
  const [formURL, setFormURL] = useState('')
  const [sheetURL, setSheetURL] = useState('')

  // Form field error states
  const [nameError, setNameError] = useState(false)
  const [endDateError, setEndDateError] = useState(' ')
  const [disablePool, setDisablePool] = useState(false)

  // Lookup data if we are editing an existing item
  useEffect(() => {
    // Function to asynchronously lookup an item
    const lookupItem = async () => {
      if (itemData?._id) {
        try {
          const electionInfo = await DATA.getItem('election', itemData._id)
          console.log('Election Info', electionInfo)
          setElectionName(electionInfo.name || '')
          setElectionDescription(electionInfo.description || '')
          setStartDate(moment(electionInfo.startDate))
          setEndDate(moment(electionInfo.endDate))
          setElectionPool(electionInfo.poolID || '')
          setFormURL(electionInfo.formURL || '')
          setSheetURL(electionInfo.sheetURL || '')

          if (electionInfo.EIN) {
            setDisablePool(true)
          }
        } catch (err) {
          alert('Error looking up election "' + itemData._id + '"')
          console.error(err)
        }
      }
    }

    // Run the async function
    lookupItem()
  }, [itemData])

  // Handle form submission
  const formSubmitted = async () => {
    let isReady = true

    // Check the pool name
    if (electionName === '') {
      setNameError(true)
      isReady = false
    }

    // Process the raw voter list data
    if (!startDate.isSameOrBefore(endDate)) {
      setEndDateError('End Date must be after start')
      isReady = false
    }

    // Stop if invalid
    if (!isReady) throw false

    // Attempt to insert/update the election object
    if (isUpdate) {
      await DATA.updateItem('election', itemData._id, {
        name: electionName,
        description: electionDescription,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        poolID: electionPool,
        sheetURL,
        formURL
      })
    } else {
      await DATA.newItem('election', {
        name: electionName,
        description: electionDescription,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        poolID: electionPool,
        sheetURL,
        formURL
      })
    }
    if (refreshData) {
      refreshData()
    }
  }

  return (
    <DialogForm
      addLabel={isUpdate ? 'Save Changes' : 'Create Election'}
      onToggle={onModalToggle}
      open={modalOpen}
      onFormSubmit={formSubmitted}
      title={isUpdate ? 'Update Existing Election' : 'Add New Election'}
      type="election"
    >

      <DialogContent>
        <DialogContentText>
          {isUpdate
            ? 'To update the election, edit the info below.'
            : 'To create a new Election, please enter the information below.'}
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
                helperText={nameError ? 'Name cannot be blank' : ' '}
                error={nameError}
                fullWidth
                value={electionName}
                onChange={(e) => { setElectionName(e.target.value) }}
                onBlur={() => { setNameError(false) }}
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
                onChange={(e) => { setElectionDescription(e.target.value) }}
              />
            </Grid>
            <Grid item sm={6}>
              <TextField
                margin="dense"
                id="votingFormURL"
                label="Voting Form URL"
                type="url"
                variant="outlined"
                fullWidth
                value={formURL}
                onChange={(e) => { setFormURL(e.target.value) }}
              />
            </Grid>
            <Grid item sm={6}>
              <TextField
                margin="dense"
                id="resultsSheetURL"
                label="Results Spreadsheet URL"
                type="url"
                variant="outlined"
                fullWidth
                value={sheetURL}
                onChange={(e) => { setSheetURL(e.target.value) }}
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
                onChange={(e) => { setStartDate(moment(e.target.value)) }}
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
                onChange={(e) => { setEndDate(moment(e.target.value)) }}
                onBlur={() => { setEndDateError(' ') }}
              />
            </Grid>
            <Grid item sm={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="poolSelectLabel">
                  {disablePool ? 'Voter Pool (EINs already generated)' : 'Voter Pool'}
                </InputLabel>
                <Select
                  labelId="poolSelectLabel"
                  id="poolSelect"
                  value={electionPool}
                  onChange={(e) => { setElectionPool(e.target.value) }}
                  label={disablePool ? 'Voter Pool (EINs already generated)' : 'Voter Pool'}
                  disabled={disablePool}
                >
                  { voterPools.map((pool) => (
                    <MenuItem key={pool._id} value={pool._id}>
                      {pool.name}
                    </MenuItem>
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
  itemData: PropTypes.object,
  isUpdate: PropTypes.bool,
  refreshData: PropTypes.func,
  voterPools: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string
    })
  )
}

ElectionForm.defaultProps = {
  voterPools: [],
  refreshData: null,
  itemData: null,
  isUpdate: false
}
