"use server";

import { db } from "@/db";
import { userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function checkAdminStatus(): Promise<boolean> {
    const { userId } = await auth();
    if (!userId) return false;

    const user = await db.query.userRoles.findFirst({
        where: eq(userRoles.clerkUserId, userId)
    });

    return user?.role === 'admin';
}

export async function syncUser() {
    const user = await currentUser();
    if (!user) return;

    const existingUser = await db.query.userRoles.findFirst({
        where: eq(userRoles.clerkUserId, user.id)
    });

    if (!existingUser) {
        await db.insert(userRoles).values({
            clerkUserId: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || "Unknown",
            role: "customer",
        });
    }
}
