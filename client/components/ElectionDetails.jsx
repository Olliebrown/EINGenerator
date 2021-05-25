import React, { useState } from 'react'
import PropTypes from 'prop-types'

import moment from 'moment'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Icon from '@material-ui/core/Icon'

import ConfirmationDialog from './ConfirmationDialog.jsx'
import EmailForm from './EmailForm.jsx'

import * as DATA from '../helpers/dataHelper.js'

// String for formatting dates with moment.js
const FMT_STRING = ' MMMM Do YYYY, h:mm a '

const oldConfirmState = {
  handleClose: null,
  title: '',
  message: ''
}

const useStyles = makeStyles((theme) => ({
  dateStyle: {
    fontWeight: 'bold'
  }
}))

function SendIcon () { return (<Icon>{'send'}</Icon>) }
function EINIcon () { return (<Icon>{'tag'}</Icon>) }

export default function ElectionDetails (props) {
  // Destructure props and create class names
  const { election } = props
  const classes = useStyles()

  const [emailFormOpen, setEmailOpen] = useState(false)
  const handleEmailFormToggle = (openState) => {
    setEmailOpen(openState)
  }

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmState, setConfirmState] = useState(oldConfirmState)

  // Are the EINs defined for this election
  const EINDefined = (election.EIN && Object.keys(election.EIN).length > 0)

  // Callback for generating EINs
  const generateEINs = () => {
    setConfirmState({
      title: 'Generate EINs',
      message: `Are you sure you want to generate EINs for election ${election.name}?`,
      handleClose: (accepted) => {
        if (accepted) {
          DATA.generateEINs(election._id)
            .then((newEIN) => {
              election.EIN = newEIN
              setConfirmOpen(false)
            })
            .catch((err) => {
              alert('Error generating EINs')
              console.error(err)
              setConfirmOpen(false)
            })
        }
      }
    })
    setConfirmOpen(true)
  }

  const showEmailForm = () => {
    if (!EINDefined) {
      alert('Please generate EINs first')
      return
    }
    setEmailOpen(true)
  }

  const onSendEmail = (emailFrom, emailSubject, emailText) => {
    const voterCount = (EINDefined ? Object.keys(election.EIN).length : 0)
    const plural = (voterCount === 1 ? 'voter' : 'voters')
    setConfirmState({
      title: 'Send Election Emails',
      message: `Are you sure you want to send emails to ${voterCount} ${plural} for election ${election.name}?`,
      handleClose: (accepted) => {
        if (accepted) {
          DATA.sendEmails(election._id, emailFrom, emailSubject, emailText)
            .then((jobID) => {
              console.log('JOB ID:', jobID)
              alert(`Email job ${jobID.toString()} Created`)
              setConfirmOpen(false)
            })
            .catch((err) => {
              alert('Error sending emails')
              console.error(err)
              setConfirmOpen(false)
            })
        }
      }
    })
    setConfirmOpen(true)
  }

  // Render Election details
  return (
    <>
      <Grid item sm={12}>
        <Typography>
          {'Runs from'}
          <span className={classes.dateStyle}>
            {moment(election.startDate).format(FMT_STRING)}
          </span>
          {'to'}
          <span className={classes.dateStyle}>
            {moment(election.endDate).format(FMT_STRING)}
          </span>
        </Typography>
      </Grid>

      <Grid item sm={12}>
        <ButtonGroup color="primary" variant="contained" aria-label="election button actions">
          <Button endIcon={<EINIcon />} disabled={EINDefined} onClick={generateEINs}>
            {'Generate EINs'}
          </Button>
          <Button endIcon={<SendIcon />} disabled={!EINDefined} onClick={showEmailForm}>
            {'Send Emails'}
          </Button>
        </ButtonGroup>
      </Grid>

      <EmailForm modalOpen={emailFormOpen} onModalToggle={handleEmailFormToggle} onSend={onSendEmail} />

      <ConfirmationDialog title={confirmState.title} open={confirmOpen} onClose={confirmState.handleClose}>
        {confirmState.message}
      </ConfirmationDialog>
    </>
  )
}

ElectionDetails.propTypes = {
  election: PropTypes.shape({
    _id: PropTypes.string,
    poolID: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    EIN: PropTypes.object,
    emailJobs: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
}
