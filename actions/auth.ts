"use server";

import { db } from "@/db";
import { userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function checkAdminStatus(): Promise<boolean> {
    const { userId } = await auth();
    if (!userId) return false;

    const user = await db.query.userRoles.findFirst({
        where: eq(userRoles.clerkUserId, userId)
    });

    return user?.role === 'admin';
}
