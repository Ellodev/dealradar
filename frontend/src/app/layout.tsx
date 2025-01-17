import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "next-auth";

import SessionProvider from "./components/SessionProvider";
import NavMenu from "./components/NavMenu";

export const metadata: Metadata = {
  title: "DealRadar",
  description: "Price tracking website for Interdiscount",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  return (
      <html lang="en" suppressHydrationWarning>
          <body>
              <SessionProvider session={session}>
                <NavMenu />
                {children}
              </SessionProvider>
          </body>
      </html>
  );
}
