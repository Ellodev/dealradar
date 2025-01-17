"use client";

import Price from './fetchPrice';
import { useState } from 'react';
import { supabase } from "../../../lib/supabase"; 
import AddToWishlist from './AddToWishlist';

import { Session } from '../../../types/types';

export default function Home({ session }: { session: Session }) {
  const [url, setUrl] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const userQuery = formData.get('query') as string;
    setUrl(userQuery);

    if (session?.user?.email) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (!data) {
        const { error: insertError } = await supabase.from("users").insert([
          {
            email: session.user.email,
            username: session.user.name,
          },
        ]);

        if (insertError) {
          console.error("Error adding user:", insertError);
        } else {
          console.log("User added successfully!");
        }
      } else {
        console.log("User already exists:", data);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-9xl font-semibold z-10">DealRadar</h1>
      <p className="z-10 mt-3 text-2xl">A Place where you can grab the best deal for the product you’ve been looking at</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          name="query"
          type="text"
          placeholder="Enter product URL"
          className="p-3 text-black rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
        />
        <button
          type="submit"
          className="p-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 focus:ring-2 focus:ring-black transition-all"
        >
          Submit
        </button>
      </form>
      <Price url={url} />
      <AddToWishlist url={url} session={session} />
    </div>
  );
}
