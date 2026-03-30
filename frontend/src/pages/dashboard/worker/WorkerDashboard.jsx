import React, { useEffect } from 'react';
import htmlContent from './worker-dashboard.html?raw';

import './worker-dashboard-styles.css';
import './worker-dashboard-additions.css';
import '../dashboard.css';

const WorkerDashboard = () => {
    useEffect(() => {
        try {
            import('./worker-dashboard.js');
            import('./worker-dashboard-part2.js');
            import('./worker-location-tracker.js');
        } catch(err) {
            console.error("Failed to inject worker dashboard modules:", err);
        }
    }, []);

    return (
        <React.Fragment>
            <div className="dashboard-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </React.Fragment>
    );
};

export default WorkerDashboard;
