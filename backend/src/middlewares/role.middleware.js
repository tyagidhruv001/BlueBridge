const { db } = require('../../config/firebase');

/**
 * Role-Based Access Control Middleware
 * Retrieves user profile from Firestore based on verified req.user.uid.
 * Ensures user possesses one of the allowed roles.
 */
function requireRole(...allowedRoles) {
    return async (req, res, next) => {
        try {
            if (!req.user?.uid) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            const userDoc = await db
                .collection('users')
                .doc(req.user.uid)
                .get();

            if (!userDoc.exists) {
                return res.status(403).json({
                    success: false,
                    error: 'User profile not found'
                });
            }

            const user = userDoc.data();

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
            }

            req.user.role = user.role;

            next();

        } catch (error) {
            next(error);
        }
    };
}

module.exports = requireRole;

