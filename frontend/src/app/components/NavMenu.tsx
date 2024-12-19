"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

function AuthButton() {
    const { data: session } = useSession();

    if (session) {
        return (
            <div className="flex items-center space-x-4">
                <span className="">{session?.user?.name}</span>
                <button
                    onClick={() => signOut()}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                >
                    Sign out
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            <span className="text-gray-800">Not signed in</span>
            <button
                onClick={() => signIn()}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
            >
                Sign in
            </button>
        </div>
    );
}

export default function NavMenu() {
    return (
        <nav className="flex justify-between items-center p-4">
            <Link href="/" className="text-2xl font-semibold hover:text-gray-600 transition-all">
                Home
            </Link>
            <div className="flex items-center space-x-4">
                <Link
                    href="/wishlist"
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all"
                >
                    Wishlist
                </Link>
                <AuthButton />
            </div>
        </nav>
    );
}
