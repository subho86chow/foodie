"use server";

import { db } from "@/db";
import { userRoles } from "@/db/schema";

// One-time script to make all existing users admins
export async function makeAllUsersAdmin() {
    const result = await db.update(userRoles)
        .set({ role: 'admin' })
        .returning();

    console.log(`Updated ${result.length} users to admin`);
    return result.length;
}
