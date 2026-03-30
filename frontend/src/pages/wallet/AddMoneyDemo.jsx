import React, { useEffect } from 'react';
import htmlContent from './add-money-demo.html?raw';



const AddMoneyDemo = () => {
    useEffect(() => {
        try {

        } catch(err) {
            console.error("Failed to inject scripts for AddMoneyDemo:", err);
        }
    }, []);

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default AddMoneyDemo;

