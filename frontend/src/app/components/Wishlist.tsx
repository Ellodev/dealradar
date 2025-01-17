"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Database } from '../../../types/supabase';

import { Session } from '../../../types/types';

type Product = Database['public']['Tables']['products']['Row'];

type ProductLink = {
  fk_product: number;
}


export default function Wishlist({ session }: { session: Session }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const getProducts = async () => {
      if (!session || !session.user) {
        console.error("Session not available");
        return;
      }
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("email", session.user.email)
          .single();

        if (userError || !userData) {
          console.error("Error fetching user:", userError);
          return;
        }

        const { data: productLinks, error: productError } = await supabase
          .from("productsXusers")
          .select("fk_product")
          .eq("fk_user", userData.id);

        if (productError || !productLinks) {
          console.error("Error fetching product links:", productError);
          return;
        }

        const productIds = productLinks.map((link: ProductLink) => link.fk_product);

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds);

        if (productsError) {
          console.error("Error fetching products:", productsError);
          return;
        }

        setProducts(productsData || []);
      } catch (error) {
        console.error("Error fetching wishlist products:", error);
      }
    };
    getProducts();
  }, [session]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-9xl font-semibold z-10">Wishlist</h1>
      {products.length > 0 ? (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <a href={`/product/${product.id}`} rel="noopener noreferrer">
                <strong>{product.product_name}</strong>
              </a>{" "}
              | <strong>Price:</strong> {product.price}
            </li>
          ))}
        </ul>
      ) : (
        <p>No products in your wishlist.</p>
      )}
    </div>
  );
}