import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/authOptions";
import Home from "./components/Home";
import { Session } from '../../types/types';

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  return <Home session={session as Session | null} />;
}