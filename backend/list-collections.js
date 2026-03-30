const { db } = require('./config/firebase');

async function listCollections() {
    console.log('--- Listing All Firestore Collections ---');
    const collections = await db.listCollections();
    const names = collections.map(col => col.id);
    console.log('Collections:', names.join(', '));
    process.exit(0);
}

listCollections().catch(err => {
    console.error(err);
    process.exit(1);
});
