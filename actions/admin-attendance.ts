"use server";

import { db } from "@/db";
import { attendance, userRoles } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Get all customers who ate on a specific date
export async function getCustomersWhoAte(dateStr: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const records = await db.select({
        id: attendance.id,
        userId: attendance.userId,
        mealName: attendance.mealName,
        price: attendance.price,
        date: attendance.date,
        userName: userRoles.name
    })
        .from(attendance)
        .leftJoin(userRoles, eq(attendance.userId, userRoles.clerkUserId))
        .where(sql`${attendance.date}::text = ${dateStr}`);

    // Group by user
    const customerMap: Record<string, { userId: string; name: string; mealCount: number; totalPrice: number }> = {};

    records.forEach(record => {
        if (!customerMap[record.userId]) {
            customerMap[record.userId] = {
                userId: record.userId,
                name: record.userName || "Unknown",
                mealCount: 0,
                totalPrice: 0
            };
        }
        customerMap[record.userId].mealCount++;
        customerMap[record.userId].totalPrice += Number(record.price);
    });

    return Object.values(customerMap);
}

// Get meals for a specific customer on a specific date
export async function getCustomerMeals(customerId: string, dateStr: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const records = await db.select()
        .from(attendance)
        .where(and(
            eq(attendance.userId, customerId),
            sql`${attendance.date}::text = ${dateStr}`
        ));

    return records;
}

// Get all customers for selection
export async function getAllCustomers() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return await db.select().from(userRoles);
}

// Add meal for multiple customers (admin)
export async function addMealForCustomers(
    customerIds: string[],
    mealName: string,
    price: number,
    dateStr: string
) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    for (const customerId of customerIds) {
        await db.insert(attendance).values({
            userId: customerId,
            mealName,
            date: dateStr,
            price: price.toString(),
            status: "confirmed"
        });
    }

    revalidatePath("/dashboard");
}

// Edit a meal (admin)
export async function editMeal(mealId: number, mealName: string, price: number) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.update(attendance)
        .set({ mealName, price: price.toString() })
        .where(eq(attendance.id, mealId));

    revalidatePath("/dashboard");
}

// Delete a meal (admin)
export async function deleteMealAdmin(mealId: number) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.delete(attendance)
        .where(eq(attendance.id, mealId));

    revalidatePath("/dashboard");
}
