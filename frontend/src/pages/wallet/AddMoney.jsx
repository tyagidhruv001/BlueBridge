import React, { useEffect } from 'react';
import htmlContent from './add-money.html?raw';



const AddMoney = () => {
    useEffect(() => {
        try {

        } catch(err) {
            console.error("Failed to inject scripts for AddMoney:", err);
        }
    }, []);

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default AddMoney;

