import React from 'react'
import PropTypes from 'prop-types'

class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError (error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch (error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error(error)
    console.error(errorInfo)
  }

  render () {
    const { children } = this.props
    const { hasError, error } = this.state
    if (hasError) {
      // You can render any custom fallback UI
      return (
        <>
          <h1>
            {'Something went wrong.'}
          </h1>
          <p>
            {error.message()}
          </p>
        </>
      )
    }

    return children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node
}

ErrorBoundary.defaultProps = {
  children: null
}

export default ErrorBoundary
