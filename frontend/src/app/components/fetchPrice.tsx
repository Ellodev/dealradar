"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

interface PriceProps {
  url: string;
  session: any;
}

export default function Price({ url, session }: PriceProps) {
  const [data, setData] = useState({
    price: "",
    productName: "",
  });

  useEffect(() => {
    const fetchPrice = async () => {
      if (url) {
        try {
          const response = await fetch(`http://127.0.0.1:5000/scrape-price?url=${url}`);
          const result = await response.json();
          
          if (result.price && result.productName) {
            setData(result);
          } else {
            setData({ price: "", productName: "" });
          }
        } catch (error) {
          setData({ price: "", productName: "" });
          console.error("Error fetching price", error);
        }
      } else {
        setData({ price: "", productName: "" });
      }
    };

    fetchPrice();

    const appendUrlToUser = async () => {
      if (session && session.user.email && url) {
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

        if (userError || !userData || error || !data) {
          console.error("Error fetching user or product data:", userError, error);
          return;
        }

        const { error: linkError } = await supabase.from("productsXusers").insert([
          {
            fk_product: data.id,
            fk_user: userData.id,
          },
        ]);

        if (linkError) {
          console.error("Error adding product-user link:", linkError);
        } else {
          console.log("Product successfully added to wishlist");
        }
      }
    };

    appendUrlToUser();
  }, [url, session]);

  if (!url || !data.productName || !data.price) {
    return null;
  }

  return (
    <div>
      <h1>Product Name</h1>
      <p>{data.productName}</p>
      <h1>Price</h1>
      <p>{data.price}</p>
    </div>
  );
}
