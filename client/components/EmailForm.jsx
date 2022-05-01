import React, { useState } from 'react'
import PropTypes from 'prop-types'

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
  const [emailFrom, setEmailFrom] = useState('')
  const [emailFromError, setEmailFromError] = useState(' ')

  const [emailSubject, setEmailSubject] = useState('')
  const [emailSubjectError, setEmailSubjectError] = useState(' ')

  const [emailText, setEmailText] = useState(' ')
  const [emailTextError, setEmailTextError] = useState(' ')
  const clearTextError = () => { setEmailTextError(' ') }

  // Handle form submission
  const formSubmitted = async () => {
    // Validate
    let isValid = true
    if (emailSubject.trim() === '') {
      setEmailSubjectError('Email subject cannot be blank')
      isValid = false
    }

    if (emailFrom.trim() === '') {
      setEmailFromError('Email subject cannot be blank')
      isValid = false
    } else {
      const matches = emailFrom.match(/(?<name>.*)<(?<email>.*)>/)
      if (matches === null) {
        // eslint-disable-next-line no-useless-escape
        if (!emailFrom.match(/^[^@\s]+@[^@\s\.]+\.[^@\.\s]+$/)) {
          setEmailFromError('Must be a valid email address')
          isValid = false
        }
      } else {
        const rawEmail = matches.groups.email?.trim()
        // eslint-disable-next-line no-useless-escape
        if (!rawEmail.match(/^[^@\s]+@[^@\s\.]+\.[^@\.\s]+$/)) {
          setEmailFromError('Must be a valid email address')
          isValid = false
        }
      }
    }

    if (emailText.trim() === '') {
      setEmailTextError('Email text cannot be empty')
      isValid = false
    }

    if (!isValid) { throw false }

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
              onChange={(e) => { setEmailFrom(e.target.value) }}
              onBlur={() => { setEmailFromError(' ') }}
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
              onChange={(e) => { setEmailSubject(e.target.value) }}
              onBlur={() => { setEmailSubjectError(' ') }}
            />
          </Grid>
          <Grid item sm={12}>
            <TinyMarkdownEditor
              content={emailText}
              onContentChanged={setEmailText}
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
