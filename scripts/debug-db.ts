import fs from "fs";
import path from "path";

// Load .env manually
try {
    const envPath = path.resolve(process.cwd(), ".env");
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach(line => {
        const [key, value] = line.split("=");
        if (key && value && !process.env[key]) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.warn("Could not load .env file", e);
}

async function main() {
    // Dynamic import to ensure env is loaded first
    const { db } = await import("../db");
    const { attendance } = await import("../db/schema");
    const { sql, eq, and, gte, lte } = await import("drizzle-orm");

    console.log("Checking DB connection and schema...");
    try {
        // Try a simple count query first
        const count = await db.select({ count: sql<number>`count(*)` }).from(attendance);
        console.log("Attendance count:", count);

        // Try selecting one record
        const record = await db.select().from(attendance).limit(1);
        console.log("First record:", record);

        // Replicate the failing query
        // Using arbitrary params similar to the error
        console.log("Testing failing query...");
        const userId = "user_36Syaxtkmbpqz41gQeRwD7daSrf"; // From error log
        const startDate = "2025-11-30";
        const endDate = "2025-12-06";

        const bills = await db.select({
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
        console.log("Failing query result:", bills);

    } catch (e: any) {
        console.error("DB Error:");
        console.error(e);
        if (e.cause) {
            console.error("Cause (JSON):", JSON.stringify(e.cause, null, 2));
        }
    }
}

main().then(() => process.exit(0)).catch((e) => {
    console.error(e);
    process.exit(1);
});
