import React, { useEffect } from 'react';
import htmlContent from './booking.html?raw';



const Booking = () => {
    useEffect(() => {
        let isMounted = true;
        try {
            import('./booking-script.js').then(() => {
                if (isMounted && typeof window.initBooking === 'function') {
                    window.initBooking();
                }
            });
        } catch(err) {
            console.error("Failed to inject scripts for Booking:", err);
        }
        return () => { isMounted = false; };
    }, []);

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default Booking;

