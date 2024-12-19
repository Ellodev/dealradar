"use client";

import { supabase } from "../../../lib/supabase"; 

export default function Wishlist({ session }: { session: any }) {
  const getProducts = async () => {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    const { data, error } = await supabase
      .from("productXusers")
      .select("*")
      .eq("fk_user", userData?.id);
  };

  getProducts();

  //TODO: Display wishlist products

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-9xl font-semibold z-10">Wishlist</h1>
    </div>
  );
}
