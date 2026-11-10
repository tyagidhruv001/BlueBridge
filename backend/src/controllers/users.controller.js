const { db } = require('../../config/firebase');

exports.saveUser = async (req, res) => {
    try {
        const uid = req.user?.uid || req.body.uid;

        if (!uid) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const {
            name, phone, email, profile_pic, fcm_token,
            saved_addresses, preferences,
            bio, payment_methods
        } = req.body;

        const userData = {
            uid,
            name,
            phone,
            email,
            profile_pic,
            fcm_token,
            saved_addresses: saved_addresses || [],
            preferences: preferences || {},
            bio: bio || '',
            payment_methods: payment_methods || [],
            updated_at: new Date().toISOString()
        };

        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();

        if (!doc.exists) {
            userData.created_at = new Date().toISOString();
            // Default role only on initial creation if supplied
            if (req.body.role) {
                userData.role = req.body.role;
            }
        }

        await userRef.set(userData, { merge: true });

        res.status(200).json({ message: 'User profile saved', data: userData });
    } catch (error) {
        console.error('Error in saveUser:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const { uid } = req.params;

        // Enforce ownership: user can only fetch their own private profile
        if (req.user && req.user.uid !== uid && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied: You can only access your own profile' });
        }

        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        let userData = userDoc.data();

        // Fetch additional data based on role
        if (userData.role === 'customer') {
            const customerDoc = await db.collection('customers').doc(uid).get();
            if (customerDoc.exists) {
                userData = { ...userData, ...customerDoc.data() };
            }
        } else if (userData.role === 'worker') {
            const workerDoc = await db.collection('workers').doc(uid).get();
            if (workerDoc.exists) {
                userData = { ...userData, ...workerDoc.data() };
            }
        }

        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: error.message });
    }
};
