import NextAuth  from "next-auth";
import GithubProvider from "next-auth/providers/github"

import { supabase } from "../../../../../lib/supabase";

import { User as NextAuthUser } from "next-auth";

interface GithubUser extends NextAuthUser {
  email: string; // GitHub email
  name: string; // GitHub display name
  image: string; // GitHub avatar
}

export const authOptions = {
    providers: [GithubProvider({
        clientId: process.env.GITHUB_ID ?? "",
        clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
], callbacks: {
   async signIn( { user } )
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email)
        .single();

   }
}
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST};