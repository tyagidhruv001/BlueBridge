const express = require('express');
const router = express.Router();
const { db, admin } = require('../../config/firebase');

// @route   POST /api/reviews
// @desc    Submit a review
router.post('/', async (req, res) => {
    try {
        const {
            booking_id,
            worker_id,
            customer_id,
            rating,
            comment
        } = req.body;

        const reviewData = {
            booking_id,
            worker_id,
            customer_id,
            rating: Number(rating),
            comment,
            created_at: new Date().toISOString()
        };

        await db.collection('reviews').add(reviewData);

        // Update Worker Average Rating (Simple aggregation)
        // Ideally this should be a Cloud Function, but doing it here for hackathon speed
        const workerRef = db.collection('workers').doc(worker_id);
        const workerDoc = await workerRef.get();
        if (workerDoc.exists) {
            const wData = workerDoc.data();
            const currentAvg = wData.rating_avg || 0;
            const totalJobs = wData.total_jobs || 0; // Assuming total_jobs increments elsewhere

            // Re-calculating properly requires all reviews, but let's do a weighted average approx or read all reviews
            // Let's read all reviews for simplicity and accuracy
            const reviewsSnap = await db.collection('reviews').where('worker_id', '==', worker_id).get();
            let sum = 0;
            let count = 0;
            reviewsSnap.forEach(doc => {
                sum += doc.data().rating;
                count++;
            });
            const newAvg = count > 0 ? (sum / count) : 0;

            await workerRef.update({
                'stats.avg_rating': parseFloat(newAvg.toFixed(1)),
                'stats.total_reviews': count // Optional: keeping total_reviews as a direct count if needed, or update stats.total_reviews
            });
        }

        res.status(201).json({ message: 'Review submitted', data: reviewData });
    } catch (error) {
        console.error('Review error:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/reviews/:worker_id
// @desc    Get reviews for a worker
router.get('/:worker_id', async (req, res) => {
    try {
        const { worker_id } = req.params;
        const snapshot = await db.collection('reviews')
            .where('worker_id', '==', worker_id)
            .get();

        const reviews = [];
        snapshot.forEach(doc => {
            reviews.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
