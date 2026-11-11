import React, { useEffect } from 'react';
import htmlContent from './customer-dashboard.html?raw';

import './customer-dashboard.css';
import './customer-dashboard-enhanced.css';
import './customer-interactive-elements.css';

const CustomerDashboard = () => {
    useEffect(() => {
        let isMounted = true;
        try {
            import('./customer-dashboard.js').then(() => {
                if (isMounted && typeof window.initCustomerDashboard === 'function') {
                    window.initCustomerDashboard(true);
                }
            });
            import('./customer-dashboard-interactive.js');
            import('./customer-realtime-tracking.js');
        } catch(err) {
            console.error("Failed to inject customer dashboard modules:", err);
        }
        return () => { isMounted = false; };
    }, []);

    return (
        <React.Fragment>
            <div className="customer-dashboard-body bg-shade-dark" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </React.Fragment>
    );
};

export default CustomerDashboard;
