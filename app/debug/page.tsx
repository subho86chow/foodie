"use client";

import { useState, useEffect } from "react";
import { getAllAttendanceDebug } from "@/actions/debug";

export default function DebugPage() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        getAllAttendanceDebug().then(setData);
    }, []);

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Debug Info</h1>
            <pre className="bg-slate-100 p-4 rounded overflow-auto max-h-[80vh]">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
