"use client";

import { useState } from "react";
import { syncClerkUsers } from "@/scripts/sync-clerk-users";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, Loader2, CheckCircle } from "lucide-react";

export default function SyncUsersPage() {
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSync = async () => {
        setIsLoading(true);
        try {
            const data = await syncClerkUsers();
            setResult(data);
        } catch (error) {
            setResult({ error: String(error) });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-md">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle>Sync Clerk Users</CardTitle>
                            <CardDescription>Import all users from Clerk and make them admins</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        onClick={handleSync}
                        disabled={isLoading}
                        className="w-full"
                        size="lg"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Syncing...
                            </>
                        ) : (
                            <>
                                <Users className="h-4 w-4 mr-2" />
                                Sync Users & Make Admins
                            </>
                        )}
                    </Button>

                    {result && !result.error && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                            <div className="flex items-center gap-2 text-green-700 font-medium">
                                <CheckCircle className="h-5 w-5" />
                                Sync Complete!
                            </div>
                            <div className="text-sm text-green-600 space-y-1">
                                <p>📊 Total Clerk Users: <strong>{result.totalClerkUsers}</strong></p>
                                <p>✨ New Users Added: <strong>{result.newUsersAdded}</strong></p>
                                <p>🔄 Existing Users Updated: <strong>{result.existingUsersUpdated}</strong></p>
                            </div>
                        </div>
                    )}

                    {result?.error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            <p className="font-medium">Error:</p>
                            <p className="text-sm">{result.error}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
