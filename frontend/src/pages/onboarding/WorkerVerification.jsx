import React, { useEffect } from 'react';
import htmlContent from './worker-verification.html?raw';

import './onboarding.css';
import '../verification/verification.css';

const WorkerVerification = () => {
    useEffect(() => {
        try {
            import('./onboarding-worker-verification.js');
        } catch(err) {
            console.error("Failed to inject scripts for WorkerVerification:", err);
        }
    }, []);

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default WorkerVerification;

