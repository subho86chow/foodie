"use client";

import { useState, useEffect } from "react";
import { createRequest, getMyRequests } from "@/actions/requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function MealRequestsPage() {
    const [mealName, setMealName] = useState("");
    const [price, setPrice] = useState("");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        const data = await getMyRequests();
        setRequests(data);
    };

    const handleSubmit = async () => {
        if (!mealName || !price || !date) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            await createRequest(mealName, parseFloat(price), date);
            setMealName("");
            setPrice("");
            loadRequests();
            toast.success("Request submitted");
        } catch (error) {
            toast.error("Failed to submit request");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Custom Meal Request</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>New Request</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Meal Name"
                            value={mealName}
                            onChange={(e) => setMealName(e.target.value)}
                        />
                        <Input
                            type="number"
                            placeholder="Estimated Price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                        <div className="border rounded-md p-4">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                            />
                        </div>
                        <Button onClick={handleSubmit} className="w-full">Submit Request</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>My Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {requests.map((req) => (
                                <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{req.mealName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(req.date).toLocaleDateString()} - ₹{req.price}
                                        </p>
                                    </div>
                                    <Badge variant={
                                        req.status === 'approved' ? 'default' :
                                            req.status === 'rejected' ? 'destructive' : 'secondary'
                                    }>
                                        {req.status}
                                    </Badge>
                                </div>
                            ))}
                            {requests.length === 0 && (
                                <p className="text-muted-foreground">No requests yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
