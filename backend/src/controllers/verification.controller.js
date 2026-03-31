const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const verificationController = {
    verify: async (req, res) => {
        try {
            const { imageUrl, imageBase64, documentType, userId, userProvidedData } = req.body;

            const apiKey = process.env.GEMINI_API_KEY;
            console.log('[AI Verification] Starting scan with API Key found:', !!apiKey);

            if (!apiKey) {
                throw new Error('GEMINI_API_KEY not configured in backend');
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            let imageData;
            let mimeType = "image/jpeg";

            if (imageBase64) {
                console.log('[AI Verification] Source: Base64');
                imageData = imageBase64.split(',')[1] || imageBase64;
            } else if (imageUrl) {
                console.log('[AI Verification] Source: External URL ->', imageUrl);
                // Fetch image and convert to base64 with a 15s timeout
                const response = await axios.get(imageUrl, { 
                    responseType: 'arraybuffer',
                    timeout: 15000 
                });
                imageData = Buffer.from(response.data, 'binary').toString('base64');
                mimeType = response.headers['content-type'] || "image/jpeg";
                console.log('[AI Verification] Image fetched successfully. Size:', imageData.length);
            } else {
                return res.status(400).json({ success: false, error: 'No image data provided' });
            }

            const prompt = `
                Perform a high-security forensic analysis of the attached Indian identification document.
                
                Protocol:
                1. Classify the document (Aadhaar, PAN, Voter ID).
                2. Verify authenticity markers. If it is NOT a clear government-issued ID, set isValid to false.
                3. Extract the 'Full Name' and 'Location/City' from the readable text.
                4. Compare the extracted name with the system-provided name: "${userProvidedData?.name || 'Worker'}".
                
                CRITICAL: Output ONLY a direct JSON object. No Markdown, no preamble.
                Structure:
                {
                    "isValid": boolean,
                    "name": "Full Name",
                    "location": "City/State",
                    "reason": "Detailed explanation"
                }

                Final Directive: If the image is not a primary ID or is unreadable, isValid MUST be false.
            `;

            console.log('[AI Verification] Analyzing image via Gemini 1.5 Flash...');
            
            // Retry logic for 503 errors
            let result;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                try {
                    result = await model.generateContent([
                        prompt,
                        {
                            inlineData: {
                                data: imageData,
                                mimeType: mimeType
                            }
                        }
                    ]);
                    break; // Success!
                } catch (error) {
                    attempts++;
                    const is503 = error.message.includes('503') || error.message.includes('Service Unavailable');
                    if (is503 && attempts < maxAttempts) {
                        console.warn(`[AI Verification] Gemini 503 error (Attempt ${attempts}/${maxAttempts}). Retrying in 2s...`);
                        await new Promise(r => setTimeout(r, 2000));
                        continue;
                    }
                    throw error; // Re-throw if not 503 or max attempts reached
                }
            }


            const responseText = await result.response.text();
            console.log('[AI Verification Response]:', responseText);

            // Extract JSON from response (handling potential markdown)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
            const aiData = JSON.parse(jsonStr.trim());

            res.status(200).json({
                success: true,
                result: {
                    isValid: aiData.isValid,
                    extractedData: {
                        name: aiData.name,
                        location: aiData.location
                    },
                    rejectionReason: aiData.reason
                },
                canProceed: aiData.isValid,
                finalStatus: aiData.isValid ? 'verified' : 'rejected'
            });

        } catch (error) {
            console.error('Real AI Verification error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

module.exports = verificationController;
