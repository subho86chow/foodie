"use client";

import { useState, useEffect } from "react";
import { getPendingRequests, approveRequest } from "@/actions/requests";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminApprovalsPage() {
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        const data = await getPendingRequests();
        setRequests(data);
    };

    const handleAction = async (id: number, approved: boolean) => {
        try {
            await approveRequest(id, approved);
            loadRequests();
            toast.success(approved ? "Request approved" : "Request rejected");
        } catch (error) {
            toast.error("Failed to update request");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Pending Approvals</h1>

            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {requests.map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">{req.mealName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        User: {req.userId} • {new Date(req.date).toLocaleDateString()} • ₹{req.price}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleAction(req.id, true)}>
                                        Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleAction(req.id, false)}>
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {requests.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">No pending requests.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
