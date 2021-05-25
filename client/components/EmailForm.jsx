import React, { useState } from 'react'
import PropTypes from 'prop-types'

// Import the commonmark MD parser
import * as Commonmark from 'commonmark'

// Import Material-UI components
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'

// Import our own custom components
import TinyMarkdownEditor from './TinyMarkdownEditor.jsx'
import DialogForm from './DialogForm.jsx'

export default function EmailForm (props) {
  // Destructure props
  const { modalOpen, onModalToggle, onSend } = props

  // Markdown element state
  const [emailFrom, updateEmailFrom] = useState('')
  const [emailFromError, updateEmailFromError] = useState(' ')

  const [emailSubject, updateEmailSubject] = useState('')
  const [emailSubjectError, updateEmailSubjectError] = useState(' ')

  const [emailText, updateEmailText] = useState(' ')
  const [emailTextError, updateEmailTextError] = useState(' ')
  const clearTextError = () => { updateEmailTextError(' ') }

  // Handle form submission
  const formSubmitted = async () => {
    // Validate
    let isValid = true
    if (emailSubject.trim() === '') {
      updateEmailSubjectError('Email subject cannot be blank')
      isValid = false
    }

    if (emailFrom.trim() === '') {
      updateEmailFromError('Email subject cannot be blank')
      isValid = false
    // eslint-disable-next-line no-useless-escape
    } else if (!emailFrom.match(/^[^@\s]+@[^@\s\.]+\.[^@\.\s]+$/)) {
      updateEmailFromError('Must be a valid email address')
      isValid = false
    }

    if (emailText.trim() === '') {
      updateEmailTextError('Email text cannot be empty')
      isValid = false
    }

    if (!isValid) {
      throw false
    }

    // Continue ...
    if (onSend) { onSend(emailFrom, emailSubject, emailText) }
  }

  return (
    <DialogForm
      addLabel="Send Email"
      onToggle={onModalToggle}
      open={modalOpen}
      onFormSubmit={formSubmitted}
      title="Email Voters"
      type="email"
      maxWidth="md"
      fullWidth
    >
      <DialogContent>
        <DialogContentText>
          {'This will send an email to all voters in the election.'}
        </DialogContentText>
        <Grid container spacing={1}>
          <Grid item sm={12}>
            <TextField
              margin="dense"
              id="emailFrom"
              label="'From' Email Address"
              type="text"
              variant="outlined"
              helperText={emailFromError}
              error={emailFromError !== ' '}
              fullWidth
              value={emailFrom}
              onChange={(e) => { updateEmailFrom(e.target.value) }}
              onBlur={() => { updateEmailFromError(' ') }}
            />
          </Grid>
          <Grid item sm={12}>
            <TextField
              margin="dense"
              id="emailSubject"
              label="Email Subject"
              type="text"
              variant="outlined"
              helperText={emailSubjectError}
              error={emailSubjectError !== ' '}
              fullWidth
              value={emailSubject}
              onChange={(e) => { updateEmailSubject(e.target.value) }}
              onBlur={() => { updateEmailSubjectError(' ') }}
            />
          </Grid>
          <Grid item sm={12}>
            <TinyMarkdownEditor
              content={emailText}
              onContentChanged={updateEmailText}
              errorMessage={emailTextError}
              clearError={clearTextError}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </DialogForm>
  )
}

EmailForm.propTypes = {
  modalOpen: PropTypes.bool.isRequired,
  onModalToggle: PropTypes.func.isRequired,
  onSend: PropTypes.func
}

EmailForm.defaultProps = {
  onSend: null
}
