const { auth, db } = require('../../config/firebase');

exports.signup = async (req, res) => {
    try {
        let { email, password, name, phone, role } = req.body;

        // Standardize phone format (Ensure +91 if missing and 10 digits)
        if (phone && !phone.startsWith('+')) {
            const digits = phone.replace(/\D/g, '');
            if (digits.length === 10) {
                phone = `+91${digits}`;
            }
        }

        console.log(`[Signup Attempt] Email: ${email}, Role: ${role}, Phone: ${phone}`);

        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name,
            phoneNumber: phone
        });

        await db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            name,
            phone,
            role,
            createdAt: new Date().toISOString()
        });

        console.log(`[Signup Success] UID: ${userRecord.uid}`);

        // Generate Firebase custom token for instant client authentication
        let token = null;
        try {
            token = await auth.createCustomToken(userRecord.uid);
        } catch (tErr) {
            console.warn('Could not generate custom token during signup:', tErr.message);
        }

        res.status(201).json({
            message: 'User created',
            uid: userRecord.uid,
            token
        });
    } catch (error) {
        console.error('Signup Error Detailed:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        // Map Firebase Auth errors to readable 400 responses
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({ error: 'This email is already registered.' });
        }
        if (error.code === 'auth/invalid-password') {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }
        if (error.code === 'auth/phone-number-already-exists') {
            return res.status(400).json({ error: 'This phone number is already registered.' });
        }
        if (error.code === 'auth/invalid-phone-number') {
            return res.status(400).json({ error: 'Invalid phone number format. Use +91XXXXXXXXXX.' });
        }

        res.status(500).json({ error: error.message || 'Internal Server Error during signup' });
    }
};

exports.login = async (req, res) => {
    const { idToken, phone } = req.body;
    try {
        let uid;
        if (idToken && idToken.startsWith('mock-token')) {
            if (process.env.NODE_ENV === 'production') {
                return res.status(401).json({
                    error: 'Mock token authentication is disabled in production'
                });
            }

            if (phone) {
                const userRecord = await auth.getUserByPhoneNumber(phone);
                uid = userRecord.uid;
            } else {
                return res.status(400).json({ error: 'Mock login requires phone number' });
            }
        } else {
            if (!idToken) {
                return res.status(400).json({ error: 'Authentication token required' });
            }
            const decodedToken = await auth.verifyIdToken(idToken);
            uid = decodedToken.uid;
        }

        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        let profileData = {};

        if (userData.role === 'worker') {
            const workerDoc = await db.collection('workers').doc(uid).get();
            if (workerDoc.exists) profileData = workerDoc.data();
        } else if (userData.role === 'customer') {
            profileData = {
                saved_addresses: userData.saved_addresses || [],
                preferences: userData.preferences || {},
                bio: userData.bio || '',
                reward_points: userData.reward_points || 0,
                payment_methods: userData.payment_methods || []
            };
        }

        // Generate custom token so client can establish full Firebase Auth session
        let token = null;
        try {
            token = await auth.createCustomToken(uid);
        } catch (tErr) {
            console.warn('Could not generate custom token during login:', tErr.message);
        }

        res.json({
            message: 'Authenticated',
            token,
            user: { ...userData, profile: profileData }
        });
    } catch (error) {
        console.error('Login Error details:', {
            message: error.message,
            code: error.code
        });
        res.status(401).json({
            error: error.message || 'Authentication failed',
            code: error.code
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { uid } = req.params;
        const updates = { ...req.body };

        // Enforce ownership: user can only update their own profile unless admin
        if (req.user && req.user.uid !== uid && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied: You can only update your own profile' });
        }

        // Strip immutable and privileged fields
        delete updates.uid;
        delete updates.email;
        delete updates.role;
        delete updates.is_verified;
        delete updates.verification_status;
        delete updates.verified_at;
        delete updates.wallet;
        delete updates.stats;
        delete updates.createdAt;
        delete updates.created_at;

        await db.collection('users').doc(uid).update(updates);

        const userDoc = await db.collection('users').doc(uid).get();
        const userData = userDoc.data();

        if (userData && userData.role === 'worker') {
            const workerData = {
                uid: uid,
                name: userData.name || 'Worker',
                is_online: true,
                updated_at: new Date().toISOString()
            };

            if (updates.location || userData.location) workerData.location = updates.location || userData.location;
            if (updates.skills && updates.skills.length > 0) {
                workerData.category = updates.skills[0].toLowerCase();
                workerData.skills = updates.skills;
            }
            if (updates.hourlyRate || userData.hourlyRate) workerData.base_price = updates.hourlyRate || userData.hourlyRate;
            if (updates.experienceYears || userData.experienceYears) workerData.experience_years = updates.experienceYears || userData.experienceYears;
            if (userData.rating || userData.rating_avg) workerData.rating_avg = userData.rating || userData.rating_avg || 4.5;
            if (userData.phone || updates.phone) workerData.phone = userData.phone || updates.phone;
            if (userData.bio || updates.bio) workerData.bio = userData.bio || updates.bio;
            if (userData.qualifications || updates.qualifications) workerData.qualifications = userData.qualifications || updates.qualifications;

            await db.collection('workers').doc(uid).set(workerData, { merge: true });
        }

        const updatedDoc = await db.collection('users').doc(uid).get();
        res.json({ message: 'Profile updated', user: updatedDoc.data() });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getDemoUser = async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Demo user access is disabled in production' });
        }

        const { role } = req.params;
        const snapshot = await db.collection('users').where('role', '==', role).limit(1).get();
        
        if (snapshot.empty) {
            const demoUid = `demo-${role}-101`;
            const defaultDemo = {
                uid: demoUid,
                name: role === 'customer' ? 'Aarav Patel (Demo)' : 'Ramesh Kumar (Demo)',
                phone: role === 'customer' ? '+919876543210' : '+919876543211',
                email: `${role}.demo@bluebridge.in`,
                role: role,
                is_verified: true,
                wallet: { balance: 2500 }
            };
            const profileData = role === 'worker' ? {
                category: 'plumber',
                profession: 'plumber',
                skills: ['Plumber', 'Pipe Repair'],
                rating_avg: 4.8,
                experience_years: 5,
                base_price: 450,
                is_online: true
            } : {
                address: 'Flat 402, Green View Apartments, Mumbai',
                city: 'Mumbai',
                pincode: '400001'
            };
            return res.json({
                user: { ...defaultDemo, loggedIn: true, isVerified: true, profile: profileData }
            });
        }
        
        const userData = snapshot.docs[0].data();
        let profileData = {};
        
        if (role === 'worker') {
            const workerDoc = await db.collection('workers').doc(userData.uid).get();
            if (workerDoc.exists) profileData = workerDoc.data();
        }
        
        res.json({
            user: { ...userData, loggedIn: true, isVerified: true, profile: profileData }
        });
    } catch (error) {
        console.error('Demo User Error:', error);
        res.status(500).json({ error: error.message });
    }
};
