"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Chart } from "./Chart"; 

interface PriceHistoryProps {
  id: bigint;
}

export default function PriceHistory({ id }: PriceHistoryProps) {
  const [priceData, setPriceData] = useState<Array<{ created_at: string; price: number }>>([]);

  useEffect(() => {
    const fetchPrice = async () => {
      const { data: priceHistoryData, error: priceHistoryError } = await supabase
        .from("price")
        .select("created_at, price")
        .eq("product_id", id);

      if (priceHistoryError) {
        console.error(priceHistoryError);
      } else if (priceHistoryData) {
        const formattedData = priceHistoryData.map((entry) => ({
          ...entry,
          created_at: new Date(entry.created_at).toLocaleDateString(), 
        }));
        setPriceData(formattedData);
      }
    };

    fetchPrice();
  }, [id]);

  return (
    <div min-width="70%">
      {priceData.length > 0 ? (
        <Chart data={priceData} />
      ) : (
        <p>Loading price history...</p>
      )}
    </div>
  );
}
