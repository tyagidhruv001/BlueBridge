import React, { useEffect } from 'react';
import htmlContent from './worker-about.html?raw';

import './onboarding.css';

const WorkerAbout = () => {
    useEffect(() => {
        try {

        } catch(err) {
            console.error("Failed to inject scripts for WorkerAbout:", err);
        }
    }, []);

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default WorkerAbout;

