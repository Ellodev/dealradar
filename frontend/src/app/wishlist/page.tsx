import { getServerSession } from "next-auth";
import { redirect } from "next/dist/server/api-utils";


export default async function Wishlist() {
    const session = await getServerSession();

    if (!session || !session.user) {
        console.log("Not authenticated.")
    } 
}