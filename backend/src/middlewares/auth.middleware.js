const { auth } = require('../../config/firebase');

/**
 * Authentication Middleware
 * Verifies Firebase ID token from Authorization: Bearer <token> header.
 * Attaches verified { uid, email, emailVerified } to req.user.
 */
async function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const token = header.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Invalid authorization header'
            });
        }

        const decoded = await auth.verifyIdToken(token);

        req.user = {
            uid: decoded.uid,
            email: decoded.email || null,
            emailVerified: !!decoded.email_verified
        };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired authentication token'
        });
    }
}

module.exports = authenticate;
