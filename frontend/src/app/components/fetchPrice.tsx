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

          setData({
            price: result.price || "",
            productName: result.productName || "",
            productDescription: result.productDescription || "",
            image: result.image || "",
          });

          const { data: productsData, error: productsError } = await supabase
            .from("products")
            .select("*")
            .eq("url", url)
            .single();

          if (productsError) {
            console.error("Error fetching products:", productsError);
            return;
          }

          setProductsData(productsData);
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

  if (!url) {
    return null;
  }

  return (
    <div>
      {data.image && <img src={data.image} alt={data.productName} style={{ maxWidth: "200px", maxHeight: "200px" }} />}
      {data.productName ? (
        productsData?.id ? (
          <a href={`/product/${productsData.id}`}><p>{data.productName}</p></a>
        ) : (
          <p>{data.productName}</p>
        )
      ) : (
        <p>Product name not available</p>
      )}
      {data.price && (
        <div>
          <h1>Price</h1>
          <p>{data.price}</p>
        </div>
      )}
      {data.productDescription && (
        <div>
          <h1>Description</h1>
          <p>{data.productDescription}</p>
        </div>
      )}
    </div>
  );
}
