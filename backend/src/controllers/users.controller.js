const { db } = require('../../config/firebase');

exports.saveUser = async (req, res) => {
    try {
        const {
            uid, name, phone, email, role, profile_pic, fcm_token,
            saved_addresses, preferences,
            bio, reward_points, payment_methods
        } = req.body;

        if (!uid) {
            return res.status(400).json({ error: 'UID is required' });
        }

        const userData = {
            uid,
            name,
            phone,
            email,
            role, // "customer" | "worker" | "admin"
            profile_pic,
            fcm_token,
            saved_addresses: saved_addresses || [],
            preferences: preferences || {},
            bio: bio || '',
            reward_points: reward_points || 0,
            payment_methods: payment_methods || [],
            updated_at: new Date().toISOString()
        };

        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();

        if (!doc.exists) {
            userData.created_at = new Date().toISOString();
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
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        let userData = userDoc.data();

        // Fetch additional data based on role
        if (userData.role === 'customer') {
            const customerDoc = await db.collection('customers').doc(uid).get();
            if (customerDoc.exists) {
                // Merge customer details (address, verification, etc.)
                // We prefer customerDoc fields if they exist
                userData = { ...userData, ...customerDoc.data() };
            }
        } else if (userData.role === 'worker') {
            const workerDoc = await db.collection('workers').doc(uid).get();
            if (workerDoc.exists) {
                // Merge worker details
                userData = { ...userData, ...workerDoc.data() };
            }
        }

        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: error.message });
    }
};
