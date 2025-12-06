"use server";

import { db } from "@/db";
import { attendance } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getAllAttendanceDebug() {
    const { userId } = await auth();
    if (!userId) return { error: "No user ID" };

    const records = await db.select().from(attendance).where(eq(attendance.userId, userId));
    console.log(`[DEBUG] All records for user ${userId}:`, JSON.stringify(records, null, 2));

    return {
        currentUserId: userId,
        serverTime: new Date().toISOString(),
        recordCount: records.length,
        records: records
    };
}
