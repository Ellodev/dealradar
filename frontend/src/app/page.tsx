import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/authOptions";
import Home from "./components/Home";
import { Session } from '../../types/types';

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <div>Please sign in to access this page</div>;
  }

  return <Home session={session as Session} />;
}