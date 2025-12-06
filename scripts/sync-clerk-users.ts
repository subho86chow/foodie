"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function syncClerkUsers() {
    const clerk = await clerkClient();
    const usersResponse = await clerk.users.getUserList({ limit: 100 });
    const users = usersResponse.data;

    let synced = 0;
    let updated = 0;

    for (const user of users) {
        const name = user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.emailAddresses[0]?.emailAddress || "Unknown";

        const phone = user.phoneNumbers[0]?.phoneNumber || null;

        // Check if user exists in our DB
        const existing = await db.query.userRoles.findFirst({
            where: eq(userRoles.clerkUserId, user.id)
        });

        if (existing) {
            // Update to admin
            await db.update(userRoles)
                .set({ role: 'admin', name })
                .where(eq(userRoles.clerkUserId, user.id));
            updated++;
        } else {
            // Insert new user as admin
            await db.insert(userRoles).values({
                clerkUserId: user.id,
                name,
                phone,
                role: 'admin'
            });
            synced++;
        }
    }

    return {
        totalClerkUsers: users.length,
        newUsersAdded: synced,
        existingUsersUpdated: updated
    };
}
