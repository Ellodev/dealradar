"use client";

import Price from './fetchPrice';
import { useState } from 'react';
import { supabase } from "../../../lib/supabase"; 
import AddToWishlist from './AddToWishlist';

import { Session } from '../../../types/types';

export default function Home({ session }: { session: Session | null }) {
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
        }
      } 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl sm:text-6xl lg:text-9xl font-semibold text-center z-10">
        DealRadar
      </h1>
      <p className="z-10 mt-3 text-lg sm:text-xl lg:text-2xl text-center">
        A Place where you can grab the best deal for the product you&apos;ve been looking at (if it&apos;s from Interdiscount)
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-4 w-full max-w-md"
      >
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

      {!session ? (
        <p className="text-red-500 mt-4 text-center">
          Please sign in to save your wishlist and track deals.
        </p>
      ) : (
        <>
          <AddToWishlist url={url} session={session} />
        </>
      )}
      <Price url={url} />
    </div>
  );
}
