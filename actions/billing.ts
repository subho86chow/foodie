"use server";

import { db } from "@/db";
import { userRoles, attendance } from "@/db/schema";
import { eq, sql, and, gte, lte, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

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

export type BillData = {
    userId: string;
    userName: string;
    startDate: string;
    endDate: string;
    totalMeals: number;
    totalAmount: number;
    meals: {
        date: string;
        mealName: string;
        price: number;
        status: string | null;
    }[];
};

export async function generateBill(userId: string, startDate: Date, endDate: Date): Promise<BillData> {
    await checkAdmin();

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const records = await db.select({
        mealName: attendance.mealName,
        price: attendance.price,
        date: attendance.date,
        status: attendance.status,
    })
        .from(attendance)
        .where(
            and(
                eq(attendance.userId, userId),
                gte(attendance.date, startStr),
                lte(attendance.date, endStr)
            )
        )
        .orderBy(desc(attendance.date));

    const userInfo = await db.query.userRoles.findFirst({
        where: eq(userRoles.clerkUserId, userId)
    });

    const totalAmount = records.reduce((sum, record) => sum + Number(record.price), 0);

    return {
        userId,
        userName: userInfo?.name || "Unknown User",
        startDate: startStr,
        endDate: endStr,
        totalMeals: records.length,
        totalAmount,
        meals: records.map(r => ({
            ...r,
            price: Number(r.price),
            date: r.date,  // Keep as string YYYY-MM-DD
            status: r.status // Ensure status is included
        }))
    };
}

export async function getMyBill(startDate: string, endDate: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const records = await db.select({
        mealName: attendance.mealName,
        price: attendance.price,
        date: attendance.date,
        status: attendance.status
    })
        .from(attendance)
        .where(
            and(
                eq(attendance.userId, userId),
                gte(attendance.date, startDate),
                lte(attendance.date, endDate)
            )
        );

    const total = records.reduce((sum, r) => sum + Number(r.price), 0);
    const breakdown: Record<string, { count: number, total: number }> = {};

    records.forEach(r => {
        const name = r.mealName;
        if (!breakdown[name]) {
            breakdown[name] = { count: 0, total: 0 };
        }
        breakdown[name].count++;
        breakdown[name].total += Number(r.price);
    });

    return { total, breakdown };
}
