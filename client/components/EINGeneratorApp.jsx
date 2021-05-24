import React, { useState, useEffect } from 'react'

import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

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
  }
}))

export default function EINGeneratorApp (props) {
  const classes = useStyles()
  const [currentTabIndex, setCurrentTabIndex] = useState(0)

  // Data from the endpoints
  const [poolData, updatePoolDate] = useState([])
  const [poolDataLoading, updatePoolDataLoading] = useState(false)
  const [electionData, updateElectionDate] = useState([])
  const [electionDataLoading, updateElectionDataLoading] = useState(false)

  // Async data retrieval
  const retrievePoolData = async () => {
    try {
      updatePoolDataLoading(true)
      const newPoolData = await DATA.getList('pool')
      updatePoolDate(newPoolData)
      updatePoolDataLoading(false)
    } catch (err) {
      console.error('Error retrieving pool data')
      console.error(err)
      alert('Failed to retrieve pool data (See console)')
    }
  }

  const retrieveElectionData = async () => {
    try {
      updateElectionDataLoading(true)
      const newElectionData = await DATA.getList('election')
      updateElectionDate(newElectionData)
      updateElectionDataLoading(false)
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
    setCurrentTabIndex(newValue)
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
        </Tabs>
      </AppBar>
      <TabPanel value={currentTabIndex} index={0}>
        <ExpandableList type="pool" loading={poolDataLoading} refreshData={retrievePoolData} itemsData={poolData} />
      </TabPanel>
      <TabPanel value={currentTabIndex} index={1}>
        <ExpandableList type="election" loading={electionDataLoading} refreshData={retrieveElectionData} itemsData={electionData} secondaryData={poolData} />
      </TabPanel>
    </div>
  )
}
