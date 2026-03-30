import React, { useEffect } from 'react';
import htmlContent from './customer-verification.html?raw';

import './onboarding.css';
import '../verification/verification.css';

const CustomerVerification = () => {
    useEffect(() => {
        try {
            import('./onboarding-customer-verification.js');
        } catch(err) {
            console.error("Failed to inject scripts for CustomerVerification:", err);
        }
    }, []);

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default CustomerVerification;

