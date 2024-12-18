"use client"

import { useState, useEffect } from 'react';

interface PriceProps {
    url: string;
}

export default function Price({url} : PriceProps) {
    const [data, setData] = useState({ price: 'Please enter a URL' });

    useEffect(() => {
        const fetchPrice = async () => {
            if (url) {
                const response = await fetch(`http://127.0.0.1:5000/scrape-price?url=${url}`);
                const result = await response.json();
                setData(result);
            } else {
                setData({ price: 'Please enter a URL' }); 
            }
        };

        fetchPrice();

        console.log(url);
    }, [url]); 

    return (
        <div>
            <h1>Price</h1>
            <p>{data.price}</p>
        </div>
    );
}
