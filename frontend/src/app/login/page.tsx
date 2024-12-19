"use client"

import { useSession } from "next-auth/react"
import { signIn } from "next-auth/webauthn"

export default function Login() {
  const { status } = useSession()

  const handleSignIn = async () => {
    // For unauthenticated users, register a new passkey
    if (status === "unauthenticated") {
      await signIn("passkey", { action: "register" })
    } else if (status === "authenticated") {
      // For authenticated users, sign in with passkey
      await signIn("passkey")
    }
  }

  return (
    <div>
      <button onClick={handleSignIn}>
        {status === "unauthenticated" ? "Register new Passkey" : "Sign in with Passkey"}
      </button>
    </div>
  )
}
