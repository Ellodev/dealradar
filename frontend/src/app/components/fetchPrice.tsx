"use client";

import { useState, useEffect } from "react";

interface PriceProps {
  url: string;
}

export default function Price({ url }: PriceProps) {
  const [data, setData] = useState({
    price: "",
    productName: "",
    productDescription: "",
  });

  useEffect(() => {
    const fetchPrice = async () => {
      if (url) {
        try {
          const response = await fetch(`http://127.0.0.1:5000/scrape-price?url=${url}`);
          const result = await response.json();
          
          if (result.price && result.productName && result.productDescription) {
            setData(result);
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
      <h1>Product Name</h1>
      <p>{data.productName}</p>
      <h1>Price</h1>
      <p>{data.price}</p>
      <h1>Product Description</h1>
      <p>{data.productDescription}</p>
    </div>
  );
}
