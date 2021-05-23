import React, { useState } from 'react'
import PropTypes from 'prop-types'

import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'

import TinyMarkdownEditor from './TinyMarkdownEditor.jsx'
import DialogForm from './DialogForm.jsx'

export default function EmailForm (props) {
  // Destructure props
  const { modalOpen, onModalToggle, onSend } = props

  // Markdown element state
  const [emailText, updateEmailText] = useState(' ')
  const [emailError, updateEmailError] = useState(' ')
  const clearError = () => { updateEmailError(' ') }

  // Handle form submission
  const formSubmitted = async () => {
    // Validate
    if (emailText.trim() === '') {
      updateEmailError('Email text cannot be empty')
      throw false
    }

    // Continue ...
    if (onSend) { onSend(emailText) }
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
        <TinyMarkdownEditor
          content={emailText}
          onContentChanged={updateEmailText}
          errorMessage={emailError}
          clearError={clearError}
        />
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
