import React, { useEffect } from 'react';
import htmlContent from './track.html?raw';



const Track = () => {
    useEffect(() => {
        try {

        } catch(err) {
            console.error("Failed to inject scripts for Track:", err);
        }
    }, []);

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default Track;

