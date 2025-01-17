"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "./../api/auth/[...nextauth]/authOptions"; 
import Wishlist from "./../components/Wishlist";
import { Session } from '../../../types/types';

export default async function WishlistPage() {
  const session = await getServerSession(authOptions); 

  if (!session) {
    return <div>Please sign in to access this page</div>;
  }

  return <Wishlist  session={session as Session} />; 
}
