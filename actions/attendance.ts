"use server";

import { db } from "@/db";
import { attendance } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getAttendance(dateStr: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const MAX_RETRIES = 3;
    let lastError;

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            // Fetch ALL records for the user to debug date matching
            const allRecords = await db.select()
                .from(attendance)
                .where(eq(attendance.userId, userId));

            // Filter in JS to ensure exact string matching
            const records = allRecords.filter(record => {
                // Handle both Date objects and strings depending on what the driver returns
                const recordDate = new Date(record.date).toISOString().split('T')[0];
                return recordDate === dateStr;
            });

            return records;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            lastError = error;
            // Wait 1s before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    throw lastError;
}

export async function addAttendance(dateStr: string, mealName: string, price: number) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.insert(attendance).values({
        userId,
        mealName,
        date: dateStr,
        price: price.toString(),
        status: "confirmed"
    });

    revalidatePath("/dashboard");
}

export async function removeAttendance(id: number) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.delete(attendance)
        .where(and(
            eq(attendance.id, id),
            eq(attendance.userId, userId)
        ));

    revalidatePath("/dashboard");
}

export async function updateMeal(id: number, mealName: string, price: number) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.update(attendance)
        .set({ mealName, price: price.toString() })
        .where(and(
            eq(attendance.id, id),
            eq(attendance.userId, userId)
        ));

    revalidatePath("/dashboard");
}

export async function getMonthlyStats() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const records = await db.select({
        price: attendance.price
    })
        .from(attendance)
        .where(and(
            eq(attendance.userId, userId),
            sql`${attendance.date} >= ${startOfMonth}`,
            sql`${attendance.date} <= ${endOfMonth}`
        ));

    const totalSpend = records.reduce((sum, r) => sum + Number(r.price), 0);
    const totalMeals = records.length;

    return { totalSpend, totalMeals };
}

export async function getRecentMeals() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const records = await db.select()
        .from(attendance)
        .where(eq(attendance.userId, userId))
        .orderBy(desc(attendance.createdAt))
        .limit(5);

    return records;
}
