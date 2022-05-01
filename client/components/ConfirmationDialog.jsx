import React from 'react'
import PropTypes from 'prop-types'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Slide from '@material-ui/core/Slide'

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function ConfirmationDialog (props) {
  const { onClose, open, title, children, ...other } = props

  const handleCancel = () => {
    onClose(false)
  }

  const handleOk = () => {
    onClose(true)
  }

  const handleClose = (event, reason) => {
    if (reason === 'escapeKeyDown' || reason === 'backdropClick') {
      onClose(false)
    }
  }

  return (
    <Dialog
      onClose={handleClose}
      disableEscapeKeyDown
      maxWidth="lg"
      aria-labelledby="confirmation-dialog-title"
      keepMounted
      TransitionComponent={Transition}
      open={open}
      {...other}
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="primary">
          {'Cancel'}
        </Button>
        <Button onClick={handleOk} color="primary">
          {'Ok'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ConfirmationDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
}

ConfirmationDialog.defaultProps = {
  onClose: () => {}
}
