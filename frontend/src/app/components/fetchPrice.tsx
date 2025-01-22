"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

interface PriceProps {
  url: string;
}

export default function Price({ url }: PriceProps) {
  const [data, setData] = useState({
    price: "",
    productName: "",
    productDescription: "",
  });

  const [productsData, setProductsData] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      if (url) {
        try {
          const response = await fetch(`https://dealradar.technify.app/scrape-price?url=${url}`);
          const result = await response.json();
          
          if (result.price && result.productName && result.productDescription) {
            setData(result);

            const { data: productsData, error: productsError } = await supabase
                      .from("products")
                      .select("*")
                      .eq("url", url)
                      .single();

            if (productsError) {
              console.error("Error fetching products:", productsError);
              return;
            }

            setProductsData(productsData)

          } else {
            setData({ price: "", productName: "", productDescription: "" });
          }
        } catch (error) {
          setData({ price: "", productName: "", productDescription: "" });
          console.error("Error fetching price", error);
        }
      } else {
        setData({ price: "", productName: "", productDescription: "" });
      }
    };

    fetchPrice();
  }, [url]);

  if (!url || !data.productName || !data.price) {
    return null;
  }

  return (
    <div>
      {productsData?.id ? (
        <a href={`/product/${productsData.id}`}><p>{data.productName}</p></a>
      ) : (
        <p>{data.productName}</p>
      )}
      <h1>Price</h1>
      <p>{data.price}</p>
    </div>
  );
}
