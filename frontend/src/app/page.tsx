import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route"; // Adjust the path if needed
import Home from "./components/Home"; // Your Home component

export default async function Page() {
  const session = await getServerSession(authOptions); // Fetch session

  return <Home session={session} />; // Pass the session as a prop to the Home component
}
