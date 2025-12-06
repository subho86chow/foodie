"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { checkAdminStatus } from "@/actions/auth";

export function MainNav() {
    const { isSignedIn, user } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (isSignedIn) {
            checkAdminStatus().then(setIsAdmin);
        }
    }, [isSignedIn]);

    return (
        <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Meal Tracker
                </Link>

                <nav className="flex items-center gap-4">
                    {isSignedIn ? (
                        <>
                            <Link href="/dashboard" className="text-sm font-medium hover:underline">
                                Dashboard
                            </Link>
                            <Link href="/my-bill" className="text-sm font-medium hover:underline">
                                My Bill
                            </Link>
                            {isAdmin && (
                                <Link href="/admin" className="text-sm font-medium hover:underline">
                                    Admin
                                </Link>
                            )}
                            <UserButton afterSignOutUrl="/" />
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Button asChild variant="ghost">
                                <Link href="/sign-in">Sign In</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/sign-up">Sign Up</Link>
                            </Button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
