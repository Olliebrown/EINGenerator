import Debug from 'debug'
const debug = Debug('server:EmailJob')

export default class EmailJob {
  constructor ({ id, _id, electionID, from, subject, bodyText, successCount, pendingCount, failedCount, status, expected }) {
    if (id === undefined && _id === undefined) {
      debug('id cannot be undefined for a new Email Job')
      throw new Error('id cannot be undefined for a new Email Job')
    }

    if (electionID === undefined) {
      debug('electionID cannot be undefined for a new Email Job')
      throw new Error('electionID cannot be undefined for a new Email Job')
    }

    // Core IDs
    this.id = _id || id
    this.electionID = electionID

    // Other email info
    this.from = from || 'error@bad.com'
    this.subject = subject || 'No subject provided'
    this.bodyText = bodyText || 'no email body provided'

    // Count of email job progress
    this.expected = expected || 0
    this.successCount = successCount || 0
    this.pendingCount = pendingCount || 0
    this.failedCount = failedCount || 0

    // Status messages
    this.status = status || {}
  }

  updateStatusCount (voterID, statusMsg) {
    // Decrement count for any existing previous status
    if (this.status[voterID] !== undefined) {
      switch (this.status[voterID].status) {
        case 'rejected':
        case 'failed':
          this.failedCount--
          break

        case 'accepted':
          this.successCount--
          break

        case 'pending':
          this.pendingCount--
          break
      }
    }

    // Increment count for new status
    switch (statusMsg) {
      case 'rejected':
      case 'failed':
        this.failedCount++
        break

      case 'accepted':
        this.successCount++
        break

      case 'pending':
        this.pendingCount++
        break
    }
  }

  addStatus (info, voter) {
    let messageStatus = 'unknown'
    if (info.accepted && info.accepted.length > 0) {
      messageStatus = 'accepted'
    } else if (info.rejected && info.rejected.length > 0) {
      messageStatus = 'rejected'
    } else if (info.pending && info.pending.length > 0) {
      messageStatus = 'pending'
    }

    if (voter) {
      this.updateStatusCount(voter.id, messageStatus)
      this.status[voter.id] = {
        messageId: info.messageId,
        email: voter.email,
        status: messageStatus
      }
    } else {
      this.status.global = info
    }
  }

  addFailure (err, voter) {
    if (voter) {
      this.failedCount++
      this.status[voter.id] = {
        messageId: 'none',
        email: voter.email,
        status: 'failure',
        error: err
      }
    } else {
      this.status.globalError = err
    }
  }

  isComplete () {
    // Do we know how many to expect
    if (this.expected <= 0) { return false }

    // Don't include pending
    return (this.successCount + this.failedCount === this.expected)
  }
}
