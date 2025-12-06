import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

// Disable cache for Next.js to avoid caching DB queries
const sql = neon(process.env.DATABASE_URL!, {
    fetchOptions: {
        cache: 'no-store'
    }
});

export const db = drizzle(sql, { schema });
