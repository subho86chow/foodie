"use client";

import { useEffect, useState } from "react";
import { makeAllUsersAdmin } from "@/scripts/make-admins";

export default function MakeAdminsPage() {
    const [result, setResult] = useState<string | null>(null);

    const handleClick = async () => {
        try {
            const count = await makeAllUsersAdmin();
            setResult(`✅ Successfully updated ${count} users to admin!`);
        } catch (error) {
            setResult(`❌ Error: ${error}`);
        }
    };

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Make All Users Admin</h1>
            <p className="text-muted-foreground">Click the button below to promote all existing users to admin.</p>
            <button
                onClick={handleClick}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
                Make All Admins
            </button>
            {result && <p className="mt-4 text-lg">{result}</p>}
        </div>
    );
}
