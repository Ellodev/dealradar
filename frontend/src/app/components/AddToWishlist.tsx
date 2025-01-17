"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Database } from '../../../types/supabase';

interface WishlistProps {
  url: string;
  session: Session;
}

import { Session } from '../../../types/types';

export default function AddToWishlist({ url, session }: WishlistProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appendUrlToUser = async () => {
    if (!session || !session.user.email) {
      setError("User is not logged in");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (userError || !userData) {
        setError("Error fetching user data");
        console.error("Error fetching user data:", userError);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("url", url)
        .single();

      if (error || !data) {
        setError("Product not found");
        console.error("Error fetching product data:", error);
        return;
      }

      const { error: linkError } = await supabase.from("productsXusers").insert([
        {
          fk_product: data.id,
          fk_user: userData.id,
        },
      ]);

      if (linkError) {
        setError("Error adding product to wishlist");
        console.error("Error adding product-user link:", linkError);
      } else {
        console.log("Product successfully added to wishlist");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Unexpected error:", error);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div>
      {url ? (
        <button
          onClick={appendUrlToUser}
          disabled={isLoading}
          className="p-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 focus:ring-2 focus:ring-black transition-all"
        >
          {isLoading ? "Adding..." : "Add to Wishlist"}
        </button>
      ) : null}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
