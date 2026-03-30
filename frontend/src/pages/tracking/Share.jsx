import React, { useEffect } from 'react';
import htmlContent from './share.html?raw';



const Share = () => {
    useEffect(() => {
        try {

        } catch(err) {
            console.error("Failed to inject scripts for Share:", err);
        }
    }, []);

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default Share;

