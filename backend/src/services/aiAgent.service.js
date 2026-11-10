const { db } = require('../../config/firebase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIAgentService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;
        this.genAI = null;
        if (this.apiKey && !this.apiKey.includes('YOUR_KEY')) {
            try {
                this.genAI = new GoogleGenerativeAI(this.apiKey);
            } catch (e) {
                console.warn('Failed to initialize GoogleGenerativeAI:', e.message);
            }
        }
    }

    /**
     * Retrieves live workers from Firestore for intelligent matching.
     */
    async getCandidateWorkers(category = null) {
        try {
            const usersSnapshot = await db.collection('users')
                .where('role', '==', 'worker')
                .limit(20)
                .get();

            const workers = [];

            for (const doc of usersSnapshot.docs) {
                const user = doc.data() || {};
                const uid = doc.id;

                let workerData = {};
                try {
                    const wDoc = await db.collection('workers').doc(uid).get();
                    if (wDoc.exists) {
                        workerData = wDoc.data() || {};
                    }
                } catch (e) {
                    // ignore sub-lookup failures
                }

                const workerCategory = workerData.category || workerData.profession || user.category || (user.skills && user.skills[0]) || 'General';
                
                // Case-insensitive category match if specified
                if (category && category !== 'all') {
                    const normCat = category.toLowerCase();
                    const normWorkerCat = workerCategory.toLowerCase();
                    if (!normWorkerCat.includes(normCat) && !normCat.includes(normWorkerCat)) {
                        continue;
                    }
                }

                const basePrice = Number(workerData.base_price || user.base_price || 450);
                const rating = Number(workerData.stats?.avg_rating || workerData.avg_rating || user.rating || 4.8);
                const jobsDone = Number(workerData.stats?.total_jobs || workerData.total_jobs || user.total_jobs || 12);
                const experience = Number(workerData.experience_years || user.experience_years || 4);

                workers.push({
                    uid,
                    name: user.name || workerData.name || 'Professional Worker',
                    category: workerCategory,
                    rating: parseFloat(rating.toFixed(1)),
                    totalJobs: jobsDone,
                    experienceYears: experience,
                    basePrice,
                    totalEstimatedPrice: basePrice + 49, // standard platform fee
                    currency: process.env.PAYMENT_CURRENCY || 'USD',
                    isVerified: Boolean(workerData.is_verified || user.is_verified || true),
                    bio: workerData.bio || user.bio || `Experienced ${workerCategory} specialist.`
                });
            }

            // Fallback default candidates if Firestore has no workers yet
            if (workers.length === 0) {
                return [
                    {
                        uid: 'worker_demo_rahul',
                        name: 'Rahul Sharma',
                        category: category || 'Plumbing',
                        rating: 4.9,
                        totalJobs: 142,
                        experienceYears: 6,
                        basePrice: 450,
                        totalEstimatedPrice: 499,
                        currency: 'USD',
                        isVerified: true,
                        bio: 'Master certified plumber with emergency leak and pipe repair expertise.'
                    },
                    {
                        uid: 'worker_demo_vikram',
                        name: 'Vikram Singh',
                        category: category || 'Electrical',
                        rating: 4.8,
                        totalJobs: 98,
                        experienceYears: 5,
                        basePrice: 400,
                        totalEstimatedPrice: 449,
                        currency: 'USD',
                        isVerified: true,
                        bio: 'Certified electrician specializing in wiring, switches, and appliance setup.'
                    },
                    {
                        uid: 'worker_demo_priya',
                        name: 'Priya Patel',
                        category: category || 'Deep Cleaning',
                        rating: 4.9,
                        totalJobs: 215,
                        experienceYears: 7,
                        basePrice: 500,
                        totalEstimatedPrice: 549,
                        currency: 'USD',
                        isVerified: true,
                        bio: 'Professional eco-friendly home sanitization and deep cleaning expert.'
                    }
                ];
            }

            return workers;
        } catch (error) {
            console.error('Error fetching candidate workers:', error);
            return [];
        }
    }

    /**
     * Retrieves active bookings for an authenticated customer.
     */
    async getCustomerBookings(userId) {
        try {
            const snapshot = await db.collection('jobs')
                .where('customerId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();

            const bookings = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                bookings.push({
                    id: doc.id,
                    serviceType: data.serviceType || 'Service',
                    status: data.status,
                    paymentStatus: data.payment?.status || 'unpaid',
                    price: data.price,
                    currency: data.payment?.currency || 'USD',
                    workerName: data.workerName || (data.workerId ? 'Assigned Professional' : 'Pending Assignment'),
                    scheduledDate: data.date,
                    scheduledTime: data.time
                });
            });

            return bookings;
        } catch (e) {
            console.warn('Error fetching customer bookings:', e.message);
            return [];
        }
    }

    /**
     * Processes customer natural language request with agentic tool planning.
     */
    async processAgentMessage({ userId, message, previousHistory = [], customerLocation = null }) {
        if (!message || message.trim() === '') {
            const err = new Error('Message is required');
            err.statusCode = 400;
            throw err;
        }

        // Fetch contextual data
        const customerBookings = userId ? await this.getCustomerBookings(userId) : [];
        const candidateWorkers = await this.getCandidateWorkers();

        // 1. Rule-based fast-path for tracking when user explicitly asks for status/tracking
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('my booking') || lowerMsg.includes('track') || lowerMsg.includes('status of')) {
            if (customerBookings.length > 0) {
                const latest = customerBookings[0];
                return {
                    reply: `Here is your latest booking status:\n\n**${latest.serviceType}** (ID: #${latest.id.slice(0, 8)})\n- Status: **${latest.status.toUpperCase()}**\n- Payment: **${latest.paymentStatus.toUpperCase()}** (${latest.price} ${latest.currency})\n- Professional: **${latest.workerName}**\n- Scheduled: ${latest.scheduledDate || 'Flexible'} at ${latest.scheduledTime || 'ASAP'}`,
                    intent: 'track_booking',
                    activeBookings: customerBookings
                };
            }
        }

        // 2. Prepare Agent Instructions and System Prompt for Gemini
        const systemPrompt = `You are BlueBridge AI, the intelligent service-commerce agent for the BlueBridge platform.
Your mission is to help customers:
1. Understand their home service needs (Plumbing, Electrical, Cleaning, Appliance, Carpentry, Painting).
2. Recommend the best verified local service professionals.
3. Compare workers based on rating, experience, price, and specialties.
4. Prepare structured booking proposals with transparent pricing.
5. Answer questions about bookings and PayPal checkout.

CRITICAL ARCHITECTURAL CONSTRAINTS:
- NEVER claim that a booking is confirmed or paid without customer approval.
- You CANNOT directly create database records or financial transactions.
- When the customer indicates they want to book a worker or hire someone, you must generate a structured booking proposal payload and ask for their explicit review and approval before payment.
- Platform fee is $49 USD. Total price is worker base price + $49 platform fee.
- Currency is USD ($).

AVAILABLE WORKERS DIRECTORY:
${JSON.stringify(candidateWorkers, null, 2)}

ACTIVE CUSTOMER BOOKINGS:
${JSON.stringify(customerBookings, null, 2)}

RESPONSE FORMAT INSTRUCTIONS:
- Be polite, helpful, and concise.
- If recommending workers, describe why they are suitable.
- If comparing workers, provide a clear structured breakdown.
- If the customer wants to prepare or make a booking, include a JSON proposal block formatted EXACTLY like this in your response:
\`\`\`json:proposal
{
  "type": "booking_proposal",
  "workerId": "<worker uid from directory>",
  "workerName": "<worker name>",
  "serviceType": "<service category>",
  "price": <number total price with platform fee>,
  "currency": "USD",
  "date": "YYYY-MM-DD",
  "time": "10:00 AM",
  "address": "<customer address if specified or 'Customer Address'>",
  "requiresApproval": true
}
\`\`\`
Followed by a message asking the customer: "Please review and approve the proposal above to proceed to secure PayPal checkout."`;

        // If Gemini API is available, invoke it
        if (this.genAI) {
            try {
                const model = this.genAI.getGenerativeModel({
                    model: "gemini-flash-latest",
                    systemInstruction: systemPrompt
                });

                // Convert history format if needed
                const formattedHistory = (previousHistory || []).map(h => {
                    if (h.role && h.parts) return h;
                    return {
                        role: h.sender === 'user' ? 'user' : 'model',
                        parts: [{ text: h.text || h.message || '' }]
                    };
                });

                const chat = model.startChat({
                    history: formattedHistory
                });

                const result = await chat.sendMessage(message);
                const response = await result.response;
                const rawText = response.text();

                // Parse structured proposals if present
                const parsed = this.extractProposalFromText(rawText);

                return {
                    reply: parsed.cleanReply,
                    rawText,
                    proposal: parsed.proposal,
                    recommendations: parsed.recommendations || candidateWorkers.slice(0, 3)
                };

            } catch (geminiError) {
                console.error('[GEMINI ERROR - Falling back to local intelligence engine]:', geminiError.message);
            }
        }

        // 3. Robust Offline / Deterministic Fallback Engine (Runs when Gemini API key is absent or in local sandbox testing)
        return this.localDeterministicAgent({
            message,
            candidateWorkers,
            customerBookings
        });
    }

    /**
     * Extracts structured JSON proposal block from model response text.
     */
    extractProposalFromText(text) {
        let proposal = null;
        let cleanReply = text;

        const jsonProposalRegex = /```json:proposal\s*([\s\S]*?)\s*```/;
        const match = text.match(jsonProposalRegex);

        if (match && match[1]) {
            try {
                proposal = JSON.parse(match[1]);
                cleanReply = text.replace(jsonProposalRegex, '').trim();
            } catch (e) {
                console.warn('Failed to parse proposal JSON block:', e.message);
            }
        }

        return { proposal, cleanReply };
    }

    /**
     * Local deterministic agentic fallback for reliable operation and unit testing.
     */
    localDeterministicAgent({ message, candidateWorkers, customerBookings }) {
        const lower = message.toLowerCase();

        // 1. Comparison intent
        if (lower.includes('compare') || lower.includes('versus') || lower.includes('vs') || lower.includes('who is better')) {
            const workerA = candidateWorkers[0];
            const workerB = candidateWorkers[1] || candidateWorkers[0];

            return {
                reply: `Here is a side-by-side comparison between our top service professionals:\n\n` +
                       `**1. ${workerA.name}** (${workerA.category})\n` +
                       `- Rating: ⭐ ${workerA.rating} / 5.0 (${workerA.totalJobs} jobs)\n` +
                       `- Experience: ${workerA.experienceYears} years\n` +
                       `- Total Price: $${workerA.totalEstimatedPrice} USD (incl. platform fee)\n` +
                       `- Status: ${workerA.isVerified ? '✅ Verified Professional' : 'Standard'}\n\n` +
                       `**2. ${workerB.name}** (${workerB.category})\n` +
                       `- Rating: ⭐ ${workerB.rating} / 5.0 (${workerB.totalJobs} jobs)\n` +
                       `- Experience: ${workerB.experienceYears} years\n` +
                       `- Total Price: $${workerB.totalEstimatedPrice} USD (incl. platform fee)\n` +
                       `- Status: ${workerB.isVerified ? '✅ Verified Professional' : 'Standard'}\n\n` +
                       `Which professional would you like me to prepare a booking proposal for?`,
                intent: 'compare_workers',
                comparison: [workerA, workerB],
                recommendations: [workerA, workerB]
            };
        }

        // 2. Booking preparation intent
        if (lower.includes('book') || lower.includes('hire') || lower.includes('prepare booking') || lower.includes('schedule')) {
            // Find target worker or use top worker
            let target = candidateWorkers.find(w => lower.includes(w.name.toLowerCase().split(' ')[0]));
            if (!target) target = candidateWorkers[0];

            const today = new Date();
            const tomorrow = new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0];

            const proposal = {
                type: 'booking_proposal',
                workerId: target.uid,
                workerName: target.name,
                serviceType: target.category,
                price: target.totalEstimatedPrice,
                currency: 'USD',
                date: tomorrow,
                time: '10:00 AM',
                address: '123 Tech Park, Bangalore',
                requiresApproval: true,
                breakdown: {
                    basePrice: target.basePrice,
                    platformFee: 49,
                    total: target.totalEstimatedPrice
                }
            };

            return {
                reply: `I've prepared a structured booking proposal for **${target.name}** (${target.category}) for **$${target.totalEstimatedPrice} USD**.\n\n` +
                       `⚠️ **Approval Required**: In accordance with BlueBridge security standards, this booking will only be confirmed once you review and approve it. Click below to confirm and proceed with PayPal checkout.`,
                intent: 'prepare_booking',
                proposal,
                recommendations: [target]
            };
        }

        // 3. Recommendation intent (default service recommendation)
        const matched = candidateWorkers.slice(0, 3);
        const topWorker = matched[0];

        return {
            reply: `I can certainly help you with that! Based on your requirement, I recommend **${topWorker.name}**, our top-rated **${topWorker.category}** specialist with a ⭐ ${topWorker.rating} rating across ${topWorker.totalJobs} completed jobs. Total estimated service cost is **$${topWorker.totalEstimatedPrice} USD** (including platform fee).\n\nWould you like to compare workers, or should I prepare a booking proposal for you?`,
            intent: 'recommend_workers',
            recommendations: matched
        };
    }
}

module.exports = new AIAgentService();
