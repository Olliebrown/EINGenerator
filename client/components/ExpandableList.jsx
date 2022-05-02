import React from 'react'
import PropTypes from 'prop-types'

import Fab from '@material-ui/core/Fab'
import { Add as AddIcon, ExpandMore as ExpandMoreIcon } from '@material-ui/icons'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'

import Typography from '@material-ui/core/Typography'

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
  // Destructure props
  const { loading, isAuthorized, itemsData, secondaryData, type, refreshData } = props

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

  // Track a request to edit an item
  const [itemToEdit, setItemToEdit] = React.useState(-1)

  // Click callback for the add button
  const onAddClick = () => {
    setItemToEdit(-1)
    setModalOpen(true)
  }

  // Callback for editing an existing item
  const onEdit = (itemID) => {
    const matchingIndex = itemsData.findIndex((item) => (item._id === itemID))
    if (matchingIndex >= 0) {
      setItemToEdit(matchingIndex)
      setModalOpen(true)
    } else {
      alert('Failed to find item ' + itemID)
    }
  }

  // Is the list empty?
  if (itemsData.length < 1 && loading) {
    return (
      <div className={classes.root}>
        <Grid container spacing={1} >
          {[...Array(SKELETON_COUNT).keys()].map(
            (value) => (
              <Grid item key={value} sm={12} >
                <Skeleton animation="wave" height={50} variant="rect" width="100%" />
              </Grid>
            )
          )}
        </Grid>
      </div>
    )
  }

  // Loop and generate Accordion elements
  const listItems = itemsData.map((itemData) => {
    const simpleID = itemData._id.slice(-6)
    return (
      <Accordion
        TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
        expanded={expanded === `panel${simpleID}`}
        key={simpleID}
        onChange={handleChange(`panel${simpleID}`)}
      >
        <AccordionSummary
          aria-controls={`${type}-panel${simpleID}-content`}
          expandIcon={<ExpandMoreIcon />}
          id={`${type}-panel${simpleID}-header`}
        >
          <Typography className={classes.heading}>
            {itemData.name}
          </Typography>

          <Typography className={classes.secondaryHeading}>
            {`${type} ${simpleID}`}
          </Typography>
        </AccordionSummary>

        <ItemViewDetails
          itemID={itemData._id}
          type={type}
          isAuthorized={isAuthorized}
          onEdit={onEdit}
        />
      </Accordion>
    )
  })

  // Render the items
  return (
    <React.Fragment>
      <div className={classes.root}>
        {(listItems.length > 0 &&
          listItems
        )}
        {(listItems.length < 1 &&
          <Typography>{'List is empty'}</Typography>
        )}

        <Fab aria-label="add" className={classes.addButton} color="primary">
          <AddIcon onClick={onAddClick} />
        </Fab>
      </div>

      {(type === 'pool' &&
        <PoolForm modalOpen={modalOpen} refreshData={refreshData} onModalToggle={handleModalToggle} isUpdate={itemToEdit >= 0} itemData={itemToEdit >= 0 ? itemsData[itemToEdit] : null} />
      )}

      {(type === 'election' &&
        <ElectionForm modalOpen={modalOpen} refreshData={refreshData} onModalToggle={handleModalToggle} voterPools={secondaryData} isUpdate={itemToEdit >= 0} itemData={itemToEdit >= 0 ? itemsData[itemToEdit] : null} />
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
  loading: PropTypes.bool,
  isAuthorized: PropTypes.bool,
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
  loading: false,
  isAuthorized: false,
  itemsData: [],
  secondaryData: [],
  type: 'none',
  refreshData: null
}
