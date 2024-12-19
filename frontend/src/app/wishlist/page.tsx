"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "./../api/auth/[...nextauth]/route"; // Adjust the path if needed
import Wishlist from "./../components/Wishlist";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions); // Fetch session

  return <Wishlist session={session} />; 
}
