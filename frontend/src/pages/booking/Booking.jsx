import React, { useEffect } from 'react';
import htmlContent from './booking.html?raw';



const Booking = () => {
    useEffect(() => {
        try {
            import('./booking-script.js');
        } catch(err) {
            console.error("Failed to inject scripts for Booking:", err);
        }
    }, []);

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default Booking;

