export async function getElectionStatus (sheetID, EINObject) {
  try {
    // Retrieve basic info about the spreadsheet
    const [sheetName, cols, rows] = await getSheetInfo(sheetID)

    // Retrieve column headers
    const headerData = await getSheetData(sheetID, sheetName, 1, 1, 1, cols)
    const headers = headerData.values[0]

    // Find EIN column
    const EINColumn = headers.findIndex((header) => (header.includes('EIN')))

    // Retrieve list of EINs
    const EINData = await getSheetData(sheetID, sheetName, 2, rows, EINColumn + 1, EINColumn + 1, 'COLUMNS')
    return createStatus(
      Object.values(EINObject).map((EINs) => (EINs[EINs.length - 1])),
      Array.isArray(EINData.values) && EINData.values.length > 0 ? EINData.values[0] : []
    )
  } catch (err) {
    alert('Error retrieving results')
    console.error(err)
  }
}

async function getSheetInfo (sheetID) {
  // Retrieve basic info about the spreadsheet
  const response = await gapi.client.sheets.spreadsheets.get({
    spreadsheetId: sheetID
  })

  // Find the 'sheet' with our data
  if (!Array.isArray(response.result?.sheets) || response.result.sheets.length <= 0) {
    throw new Error('Could not find data in spreadsheet')
  }

  // Extract sheet info
  const sheetName = response.result.sheets[0].properties.title
  const cols = response.result.sheets[0].properties.gridProperties.columnCount
  const rows = response.result.sheets[0].properties.gridProperties.rowCount
  return [sheetName, cols, rows]
}

async function getSheetData (sheetID, sheetName, startRow, endRow, startCol, endCol, majorDim = 'ROWS') {
  // convert column numbers to letters
  const start = numToSSColumn(startCol)
  const end = numToSSColumn(endCol)

  // Get column headers
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: sheetID,
    range: `${sheetName}!${start}${startRow}:${end}${endRow}`,
    majorDimension: majorDim
  })

  return response.result
}

function numToSSColumn (num) {
  let s = ''
  let t

  while (num > 0) {
    t = (num - 1) % 26
    s = String.fromCharCode(65 + t) + s
    num = (num - t) / 26 | 0
  }
  return s || undefined
}

function createStatus (expectedRaw, foundRaw) {
  // Clean up the EINs
  const expected = expectedRaw.map((val) => val.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
  const found = foundRaw.map((val) => val.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())

  const remaining = {}
  expected.forEach((value) => { remaining[value] = true })

  // Compare and count up the EINs
  let unknowns = 0
  let duplicates = 0
  const seen = {}
  found.forEach((EIN) => {
    if (expected.find((val) => (EIN === val))) {
      if (seen[EIN]) {
        duplicates++
      } else {
        seen[EIN] = true
        delete remaining[EIN]
      }
    } else {
      unknowns++
    }
  })

  // Return the counts
  return {
    responses: Object.keys(seen).map((EIN) => EIN.replace(/\B(?=(\d{3})+(?!\d))/g, '-')),
    remaining: Object.keys(remaining).map((EIN) => EIN.replace(/\B(?=(\d{3})+(?!\d))/g, '-')),
    unknowns,
    duplicates
  }
}
