"use server";

import { db } from "@/db";
import { mealRequests, attendance } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createRequest(mealName: string, price: number, date: Date) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.insert(mealRequests).values({
        userId,
        mealName,
        price: price.toString(),
        date: date.toISOString().split('T')[0],
        status: "pending"
    });
    revalidatePath("/dashboard/requests");
}

export async function getMyRequests() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return await db.select()
        .from(mealRequests)
        .where(eq(mealRequests.userId, userId))
        .orderBy(desc(mealRequests.createdAt));
}

// Admin actions
export async function getPendingRequests() {
    // TODO: Add admin check
    return await db.select()
        .from(mealRequests)
        .where(eq(mealRequests.status, "pending"))
        .orderBy(desc(mealRequests.createdAt));
}

export async function approveRequest(id: number, approved: boolean) {
    // TODO: Add admin check

    const request = await db.query.mealRequests.findFirst({
        where: eq(mealRequests.id, id)
    });

    if (!request) throw new Error("Request not found");

    if (approved) {
        // Add to attendance
        await db.insert(attendance).values({
            userId: request.userId,
            mealName: request.mealName,
            date: request.date,
            price: request.price,
            status: "confirmed"
        });
    }

    await db.update(mealRequests)
        .set({ status: approved ? "approved" : "rejected" })
        .where(eq(mealRequests.id, id));

    revalidatePath("/admin/approvals");
}
