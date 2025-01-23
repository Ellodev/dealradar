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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
        <div className="p-6">
          {data.image && (
            <div className="mb-6 text-center">
              <img
                src={data.image}
                alt={data.productName}
                className="max-h-80 mx-auto object-contain rounded-lg shadow-md"
              />
            </div>
          )}
          {data.productName ? (
            productsData?.id ? (
              <a
                href={`/product/${productsData.id}`}
                className="text-2xl font-bold hover:text-blue-600 transition-colors duration-300 mb-4 block text-center underline"
              >
                {data.productName}
              </a>
            ) : (
              <p className="text-2xl font-bold text-center">{data.productName}</p>
            )
          ) : (
            <p className="text-2xl font-bold text-center">Product name not available</p>
          )}
          {data.price && (
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                Price: ${data.price}
              </span>
            </div>
          )}
          {data.productDescription && (
            <div className="prose prose-sm dark:prose-invert max-w-prose mx-auto">
              <p className="text-gray-600 dark:text-gray-300 text-center">
                {data.productDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
