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
    image: "",
  });

  const [productsData, setProductsData] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      if (url) {
        try {
          const response = await fetch(`https://server.dealradar.technify.app/scrape-price?url=${url}`);
          const result = await response.json();
          
          if (result.price && result.productName && result.productDescription && result.image) {
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
            setData({ price: "", productName: "", productDescription: "", image: "" });
          }
        } catch (error) {
          setData({ price: "", productName: "", productDescription: "", image: "" });
          console.error("Error fetching price", error);
        }
      } else {
        setData({ price: "", productName: "", productDescription: "", image: "" });
      }
    };

    fetchPrice();
  }, [url]);

  if (!url || !data.productName || !data.price) {
    return null;
  }

  return (
    <div>
      <img src={data.image} className="max-width: 200px max-height: 200px"></img>
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
