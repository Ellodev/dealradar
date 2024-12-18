"use client"

import Price from './fetchPrice';
import Form from 'next/form';
import { useState } from 'react';

export default function Home() {
const [url, setUrl] = useState('');

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const userQuery = formData.get('query') as string;

    setUrl(userQuery);
}

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-9xl font-semi-bold z-10">DealRadar</h1>
      <p className="z-10 mt-3 text-2xl">A Place where you can grab the best deal for the product you’ve been looking at</p>

      <form onSubmit={handleSubmit}>
      <input name="query" />
      <button type="submit">Submit</button>
    </form>
      <Price url={url} />
    </div>
    
  );
}
