const verificationController = {
    verify: async (req, res) => {
        try {
            const { imageBase64, documentType, userId, userProvidedData } = req.body;

            if (!imageBase64 || !documentType) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing image or document type'
                });
            }

            // Simulate AI processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock AI Result
            const result = {
                isValid: true,
                confidenceScore: 98.5,
                extractedData: {
                    name: userProvidedData.name || 'John Doe',
                    idNumber: 'ABCD' + Math.floor(Math.random() * 10000),
                    dob: '1990-01-01',
                    address: userProvidedData.address || '123 Verified Lane'
                },
                issues: []
            };

            res.status(200).json({
                success: true,
                result: result,
                canProceed: true,
                finalStatus: 'verified',
                rejectionReason: null
            });

        } catch (error) {
            console.error('Verification error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

module.exports = verificationController;
