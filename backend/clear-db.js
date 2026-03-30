const { auth, db } = require('./config/firebase');

const COLLECTIONS_TO_CLEAR = [
    'users',
    'customers',
    'workers',
    'jobs',
    'bookings',
    'transactions',
    'support_tickets',
    'reviews',
    // 'referrals',
    'notifications',
    'locations',
    'favorites',
    'chats',
    'documentVerifications'
];

async function deleteCollection(collectionPath, batchSize = 100) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
}

async function clearAuthentication() {
    console.log('--- Clearing Firebase Authentication ---');
    let deleteCount = 0;
    
    async function deleteUsers(nextPageToken) {
        const result = await auth.listUsers(100, nextPageToken);
        const uids = result.users.map(user => user.uid);
        
        if (uids.length > 0) {
            await auth.deleteUsers(uids);
            deleteCount += uids.length;
            console.log(`Deleted ${deleteCount} users...`);
        }
        
        if (result.pageToken) {
            await deleteUsers(result.pageToken);
        }
    }
    
    await deleteUsers();
    console.log(`Total Auth Users Deleted: ${deleteCount}`);
}

async function clearFirestore() {
    console.log('--- Clearing Firestore Collections ---');
    for (const collection of COLLECTIONS_TO_CLEAR) {
        process.stdout.write(`Clearing collection: ${collection}... `);
        await deleteCollection(collection);
        console.log('Done.');
    }
}

async function main() {
    console.log('!!! DATABASE CLEAR INITIALIZED !!!');
    try {
        await clearAuthentication();
        await clearFirestore();
        console.log('!!! DATABASE SUCCESSFULLY CLEARED !!!');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing database:', error);
        process.exit(1);
    }
}

main();
