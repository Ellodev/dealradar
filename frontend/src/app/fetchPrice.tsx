"use client"

import { useState, useEffect } from 'react';
import { supabase } from "../../lib/supabase"; 


interface PriceProps {
    url: string;
    session: any;
}

export default function Price({ url, session }: PriceProps ) {
    const [data, setData] = useState({ price: 'Please enter a URL' });

    useEffect(() => {
        const fetchPrice = async () => {
            if (url) {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/scrape-price?url=${url}`);
                    const result = await response.json();
                    setData(result);
                } catch (error) {
                    setData({ price: 'Error fetching price' });
                }
            } else {
                setData({ price: 'Please enter a URL' });
            }
        };

        fetchPrice();

        const insertUrl = async () => {
            const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("url", url)
            .single();

            if (!data && url) {
                const { error: insertError } = await supabase.from("products").insert([
                    { url: url },
                ]);
                if (insertError) {
                    console.error("Error adding product URL:", insertError);
                }
            }
        };

        insertUrl();

        const appendUrlToUser = async () => {
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("id")
                .eq("email", session.user.email)
                .single();

            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("url", url)
                .single();    

            if (userError || !userData) {
                console.error("Error fetching user data:", userError);
                return;
            }

            const productData = await insertUrl();

            const { error: linkError } = await supabase.from("productsXusers").insert([
                {
                    fk_product: data.id,  
                    fk_user: userData.id, 
                }
            ]);

            if (linkError) {
                console.error("Error adding product-user link:", linkError);
            }
        };

        if (session.user.email !== null && session.user.email) {
            appendUrlToUser();
        }

        
        

    }, [url, session]);

    return (
        <div>
            <h1>Price</h1>
            <p>{data.price}</p>
        </div>
    );
}
