/**
 * Authoritative Booking State Transitions
 * 
 * Legitimate States:
 * - pending: newly created booking (unassigned or awaiting worker acceptance)
 * - assigned: matched with a specific worker
 * - accepted: worker has accepted and committed to the job
 * - in_progress: worker has begun service delivery
 * - completed: service has been successfully fulfilled
 * - cancelled: terminated by customer or system prior to commencement
 * - declined: worker declined assigned request (can return to pending pool)
 */
const transitions = {
    pending: ['assigned', 'accepted', 'cancelled'],
    assigned: ['accepted', 'declined', 'cancelled'],
    accepted: ['in_progress', 'cancelled'],
    in_progress: ['completed'],
    completed: [],
    cancelled: [],
    declined: ['pending', 'cancelled']
};

/**
 * Validates whether a state transition is permitted.
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 * @returns {boolean}
 */
function canTransition(currentStatus, nextStatus) {
    if (!currentStatus) return nextStatus === 'pending';
    if (currentStatus === nextStatus) return true; // Idempotent no-op
    return transitions[currentStatus]?.includes(nextStatus) || false;
}

module.exports = {
    transitions,
    canTransition
};

