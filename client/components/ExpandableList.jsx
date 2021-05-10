import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'

import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import Grid from '@material-ui/core/Grid'
import Skeleton from '@material-ui/lab/Skeleton'

import { makeStyles } from '@material-ui/core/styles'

import ItemViewDetails from './ItemViewDetails.jsx'
import PoolForm from './PoolForm.jsx'
import ElectionForm from './ElectionForm.jsx'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
    flexBasis: '33.33%',
    flexShrink: 0
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  },
  addButton: {
    margin: 0,
    right: 20,
    bottom: 20,
    position: 'fixed'
  }
}))

// How many skeletons to draw when waiting for data
const SKELETON_COUNT = 5

export default function ExpandableList (props) {
  // Generate style class names
  const classes = useStyles()

  // Track expanded state of accordion
  const [expanded, setExpanded] = React.useState(false)
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  // Track the modal state
  const [modalOpen, setModalOpen] = React.useState(false)
  const handleModalToggle = (openState) => {
    setModalOpen(openState)
  }

  // Click callback for the add button
  const onAddClick = () => {
    setModalOpen(true)
  }

  // Is the list empty?
  if (props.itemsData.length < 1) {
    return (
      <div className={classes.root}>
        <Grid
          container
          spacing={1}
        >
          {[...Array(SKELETON_COUNT).keys()].map(
            (value) => (
              <Grid
                item
                key={value}
                sm={12}
              >
                <Skeleton
                  animation="wave"
                  height={50}
                  variant="rect"
                  width="100%"
                />
              </Grid>
            )
          )}
        </Grid>
      </div>
    )
  }

  // Loop and generate Accordion elements
  const listItems = props.itemsData.map((itemData) => {
    const simpleID = itemData._id.slice(-6)
    return (
      <Accordion
        TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
        expanded={expanded === `panel${simpleID}`}
        key={simpleID}
        onChange={handleChange(`panel${simpleID}`)}
      >
        <AccordionSummary
          aria-controls={`${props.type}-panel${simpleID}-content`}
          expandIcon={<ExpandMoreIcon />}
          id={`${props.type}-panel${simpleID}-header`}
        >
          <Typography className={classes.heading}>
            {itemData.name}
          </Typography>

          <Typography className={classes.secondaryHeading}>
            {`${props.type} ${simpleID}`}
          </Typography>
        </AccordionSummary>

        <ItemViewDetails
          itemID={itemData._id}
          type={props.type}
        />
      </Accordion>
    )
  })

  // Render the items
  return (
    <React.Fragment>
      <div className={classes.root}>
        {listItems}

        <Fab aria-label="add" className={classes.addButton} color="primary">
          <AddIcon onClick={onAddClick} />
        </Fab>
      </div>

      {(props.type === 'pool' &&
        <PoolForm modalOpen={modalOpen} refreshData={props.refreshData} onModalToggle={handleModalToggle} />
      )}

      {(props.type === 'election' &&
        <ElectionForm modalOpen={modalOpen} refreshData={props.refreshData} onModalToggle={handleModalToggle} voterPools={props.secondaryData} />
      )}
    </React.Fragment>
  )
}

const dataShape = {
  type: PropTypes.string,
  _id: PropTypes.string,
  name: PropTypes.string
}

ExpandableList.propTypes = {
  itemsData: PropTypes.arrayOf(
    PropTypes.shape(dataShape)
  ),
  secondaryData: PropTypes.arrayOf(
    PropTypes.shape(dataShape)
  ),
  type: PropTypes.string,
  refreshData: PropTypes.func
}

ExpandableList.defaultProps = {
  itemsData: [],
  secondaryData: [],
  type: 'none'
}
