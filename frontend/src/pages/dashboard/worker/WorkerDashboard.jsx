import React, { useEffect } from 'react';
import htmlContent from './worker-dashboard.html?raw';

import './worker-dashboard-styles.css';
import './worker-dashboard-additions.css';
import '../dashboard.css';

const WorkerDashboard = () => {
    useEffect(() => {
        let isMounted = true;
        try {
            import('./worker-dashboard.js').then(() => {
                if (isMounted && typeof window.initDashboard === 'function') {
                    window.initDashboard();
                }
            });
            import('./worker-dashboard-part2.js');
            import('./worker-location-tracker.js');
        } catch(err) {
            console.error("Failed to inject worker dashboard modules:", err);
        }
        return () => { isMounted = false; };
    }, []);

    return (
        <React.Fragment>
            <div className="dashboard-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </React.Fragment>
    );
};

export default WorkerDashboard;
