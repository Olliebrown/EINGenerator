import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import TinyMDE from 'tiny-markdown-editor'
import 'tiny-markdown-editor/dist/tiny-mde.css'

const useStyles = makeStyles((theme) => ({
  paperRoot: {
    padding: theme.spacing(1),
    borderColor: props => (
      props.errorMessage === ' ' ? '' : theme.palette.error.main
    )
  },
  editorRoot: {
    height: 200,
    overflowY: 'scroll'
  },
  errorText: {
    color: theme.palette.error.main
  }
}))

export default function TinyMarkdownEditor (props) {
  // Destructure props
  const { content, onContentChanged, errorMessage, clearError } = props

  // Create class names
  const classes = useStyles(props)

  // Element refs for TinyMDE
  const toolbarRef = useRef(null)
  const editorRef = useRef(null)
  const [editorVisible, setEditorVisible] = useState(false)
  const [toolbarVisible, setToolbarVisible] = useState(false)

  // Persistent editor variables
  const MDE = useRef(null)

  useEffect(() => {
    if (toolbarVisible && editorVisible && MDE.current === null) {
      // Make TinyMDE elements
      const newEditor = new TinyMDE.Editor({ element: editorRef.current, content })
      const newToolbar = new TinyMDE.CommandBar({ element: toolbarRef.current, editor: newEditor })

      // Control the text content
      newEditor.addEventListener('change', (event) => {
        if (clearError) { clearError() }
        if (onContentChanged) { onContentChanged(event.content) }
      })

      // Update editor object
      MDE.current = { editor: newEditor, toolbar: newToolbar }
    }
  }, [toolbarVisible, editorVisible])

  return (
    <>
      <Paper variant="outlined" className={classes.paperRoot}>
        <Grid container spacing={1}>
          <Grid item sm={12}>
            <div ref={el => { toolbarRef.current = el; setToolbarVisible(!!el) }} />
          </Grid>
          <Grid item sm={12}>
            <div
              className={classes.editorRoot}
              ref={el => { editorRef.current = el; setEditorVisible(!!el) }}
            />
          </Grid>
        </Grid>
      </Paper>
      <Typography variant="caption" className={classes.errorText}>{errorMessage}</Typography>
    </>
  )
}

TinyMarkdownEditor.propTypes = {
  content: PropTypes.string,
  errorMessage: PropTypes.string,
  onContentChanged: PropTypes.func,
  clearError: PropTypes.func
}

TinyMarkdownEditor.defaultProps = {
  content: ' ',
  onContentChanged: null,
  errorMessage: ' ',
  clearError: null
}
