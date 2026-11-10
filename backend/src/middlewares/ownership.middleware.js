const { db } = require('../../config/firebase');

/**
 * Ensures that the authenticated user is accessing their own profile/resource by UID parameter.
 * @param {string} paramName - Name of the route parameter containing the user ID (default: 'uid')
 */
function requireSelf(paramName = 'uid') {
    return (req, res, next) => {
        const targetId = req.params[paramName];
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        if (req.user.uid !== targetId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied: You can only access your own profile'
            });
        }
        next();
    };
}

/**
 * Checks that the authenticated user is a participant (customer or assigned worker) in the specified job/booking.
 * @param {string} paramName - Name of the route parameter containing the job ID (default: 'id')
 */
function requireJobParticipant(paramName = 'id') {
    return async (req, res, next) => {
        try {
            const jobId = req.params[paramName];
            if (!req.user || !req.user.uid) {
                return res.status(401).json({ success: false, error: 'Authentication required' });
            }

            const docRef = db.collection('jobs').doc(jobId);
            const doc = await docRef.get();

            if (!doc.exists) {
                return res.status(404).json({ success: false, error: 'Job not found' });
            }

            const job = doc.data();
            const isCustomer = job.customerId === req.user.uid;
            const isWorker = job.workerId === req.user.uid;
            const isAdmin = req.user.role === 'admin';

            // Allow workers to claim unassigned pending jobs
            const isClaimingPendingWorker = (req.method === 'PUT' && job.status === 'pending' && (!job.workerId || job.workerId === 'auto-assign'));

            if (!isCustomer && !isWorker && !isAdmin && !isClaimingPendingWorker) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied: You are not authorized for this job'
                });
            }

            req.job = { id: doc.id, ...job };
            next();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = {
    requireSelf,
    requireJobParticipant
};

