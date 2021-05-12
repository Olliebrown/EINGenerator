import React from 'react'
import PropTypes from 'prop-types'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'

const SlideTransition = React.forwardRef(function SlideTransition (props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

function FormDialog (props) {
  // Destructure props
  const { open, onToggle, onFormSubmit, children, title, addLabel } = props

  const handleCancel = () => {
    onToggle(false)
  }

  const handleConfirm = async () => {
    if (onFormSubmit) {
      try {
        await onFormSubmit()
        onToggle(false)
      } catch (err) {
        if (err) {
          window.alert('An error occurred')
          console.error(err)
        }
      }
    }
  }

  return (
    <div>
      <Dialog open={open} onClose={handleCancel} aria-labelledby="poolForm-dialog-title" TransitionComponent={SlideTransition}>
        <DialogTitle id="poolForm-dialog-title">
          {title}
        </DialogTitle>
        {children}
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            {'Cancel'}
          </Button>
          <Button onClick={handleConfirm} color="primary">
            {addLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

FormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onFormSubmit: PropTypes.func,
  children: PropTypes.node,
  title: PropTypes.string,
  addLabel: PropTypes.string
}

FormDialog.defaultProps = {
  title: 'Add New Item',
  addLabel: 'Add Item',
  onFormSubmit: null,
  children: null
}

export default FormDialog
