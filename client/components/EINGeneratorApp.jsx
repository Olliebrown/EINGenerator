import EventEmitter from 'eventemitter3'

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Badge from '@material-ui/core/Badge'

import { AccountCircle as AccountCircleIcon } from '@material-ui/icons'

import { makeStyles } from '@material-ui/core/styles'

import TabPanel from './TabPanel.jsx'
import ExpandableList from './ExpandableList.jsx'

import * as DATA from '../helpers/dataHelper.js'

function a11yProps (index) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`
  }
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1
  },
  rightAlign: {
    marginLeft: 'auto'
  }
}))

export default function EINGeneratorApp (props) {
  const { authEmitter } = props

  const classes = useStyles()
  const [currentTabIndex, setCurrentTabIndex] = useState(0)

  // Google Authorization state
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Data from the endpoints
  const [poolData, setPoolData] = useState([])
  const [poolDataLoading, setPoolDataLoading] = useState(false)
  const [electionData, setElectionData] = useState([])
  const [electionDataLoading, setElectionDataLoading] = useState(false)

  // Listen for updates from the authorization emitter
  useEffect(() => {
    authEmitter.on('initialized', () => {
      setIsInitialized(true)
    })

    authEmitter.on('authorized', () => {
      setIsAuthorized(true)
    })

    authEmitter.on('revoked', () => {
      setIsAuthorized(false)
    })
  }, [authEmitter])

  // Callback for the account button
  const onAccountButtonClick = () => {
    if (!isAuthorized) {
      authEmitter.emit('authorize')
    } else {
      authEmitter.emit('revoke')
    }
  }

  // Async data retrieval
  const retrievePoolData = async () => {
    try {
      setPoolDataLoading(true)
      const newPoolData = await DATA.getList('pool')
      setPoolData(newPoolData)
      setPoolDataLoading(false)
    } catch (err) {
      console.error('Error retrieving pool data')
      console.error(err)
      alert('Failed to retrieve pool data (See console)')
    }
  }

  const retrieveElectionData = async () => {
    try {
      setElectionDataLoading(true)
      const newElectionData = await DATA.getList('election')
      setElectionData(newElectionData)
      setElectionDataLoading(false)
    } catch (err) {
      console.error('Error retrieving election data')
      console.error(err)
      alert('Failed to retrieve election data (See console)')
    }
  }

  // Initial data retrieval
  useEffect(() => { retrievePoolData() }, [])
  useEffect(() => { retrieveElectionData() }, [])

  const handleTabChange = (event, newValue) => {
    if (newValue < 2) {
      setCurrentTabIndex(newValue)
    }
  }

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={currentTabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          aria-label="EIN generator tabs"
        >
          <Tab label="Voter Pools" {...a11yProps(0)} />
          <Tab label="Elections" {...a11yProps(1)} />
          <Tab
            className={classes.rightAlign}
            onClick={onAccountButtonClick}
            enabled={isInitialized}
            icon={
              <Badge color="primary" variant="dot" invisible={!isAuthorized}>
                <AccountCircleIcon />
              </Badge>
            }
          />
        </Tabs>
      </AppBar>

      <TabPanel value={currentTabIndex} index={0}>
        <ExpandableList type="pool" loading={poolDataLoading} refreshData={retrievePoolData} itemsData={poolData} />
        {/* <Typography>{'Tab 1'}</Typography> */}
      </TabPanel>

      <TabPanel value={currentTabIndex} index={1}>
        <ExpandableList type="election" loading={electionDataLoading} refreshData={retrieveElectionData} itemsData={electionData} secondaryData={poolData} />
        {/* <Typography>{'Tab 2'}</Typography> */}
      </TabPanel>
    </div>
  )
}

EINGeneratorApp.propTypes = {
  authEmitter: PropTypes.objectOf(EventEmitter).isRequired
}
