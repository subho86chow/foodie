"use server";

import { db } from "@/db";
import { userRoles, attendance } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Helper to check admin
async function checkAdmin() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.query.userRoles.findFirst({
        where: eq(userRoles.clerkUserId, userId)
    });

    if (user?.role !== 'admin') {
        throw new Error("Forbidden: Admin access required");
    }
    return true;
}

// --- Customers ---

export async function getCustomers() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Just return all users - admin check happens at page level
    return await db.select().from(userRoles).orderBy(desc(userRoles.createdAt));
}

export async function makeAdmin(clerkId: string) {
    await checkAdmin();
    await db.update(userRoles)
        .set({ role: 'admin' })
        .where(eq(userRoles.clerkUserId, clerkId));
    revalidatePath("/admin/customers");
}

export async function removeAdmin(clerkId: string) {
    await checkAdmin();
    await db.update(userRoles)
        .set({ role: 'customer' })
        .where(eq(userRoles.clerkUserId, clerkId));
    revalidatePath("/admin/customers");
}

export async function syncUser(clerkId: string, name: string, email?: string) {
    const existing = await db.query.userRoles.findFirst({
        where: eq(userRoles.clerkUserId, clerkId)
    });

    if (!existing) {
        await db.insert(userRoles).values({
            clerkUserId: clerkId,
            name: name || email || "Unknown",
            role: "customer"
        });
    }
}

// --- Bills ---

export async function generateMonthlyBill(month: number, year: number) {
    await checkAdmin();

    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const records = await db.select({
        userId: attendance.userId,
        userName: userRoles.name,
        mealName: attendance.mealName,
        price: attendance.price,
        date: attendance.date
    })
        .from(attendance)
        .leftJoin(userRoles, eq(attendance.userId, userRoles.clerkUserId))
        .where(sql`${attendance.date} >= ${startDate} AND ${attendance.date} <= ${endDate}`);

    const bills: Record<string, any> = {};

    records.forEach(record => {
        if (!bills[record.userId]) {
            bills[record.userId] = {
                userId: record.userId,
                userName: record.userName || "Unknown",
                total: 0,
                breakdown: {}
            };
        }

        const bill = bills[record.userId];
        bill.total += Number(record.price);

        const mealName = record.mealName || "Custom Meal";
        if (!bill.breakdown[mealName]) {
            bill.breakdown[mealName] = { count: 0, total: 0 };
        }
        bill.breakdown[mealName].count++;
        bill.breakdown[mealName].total += Number(record.price);
    });

    return Object.values(bills);
}
