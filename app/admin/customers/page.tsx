"use client";

import { useState, useEffect } from "react";
import { getCustomers, makeAdmin, removeAdmin } from "@/actions/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, Shield, ShieldOff, Loader2 } from "lucide-react";

type Customer = {
    clerkUserId: string;
    name: string;
    role: string;
    phone: string | null;
    createdAt: Date | null;
};

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setIsLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (error) {
            toast.error("Failed to load customers");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMakeAdmin = async (id: string) => {
        setActionLoading(id);
        try {
            await makeAdmin(id);
            loadCustomers();
            toast.success("User promoted to Admin");
        } catch (error) {
            toast.error("Failed to promote user");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveAdmin = async (id: string) => {
        setActionLoading(id);
        try {
            await removeAdmin(id);
            loadCustomers();
            toast.success("Admin demoted to Customer");
        } catch (error) {
            toast.error("Failed to demote user");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Customers</h1>
                    <p className="text-muted-foreground">Manage all registered users</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({customers.length})</CardTitle>
                    <CardDescription>Promote or demote users as administrators</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map((customer) => (
                                    <TableRow key={customer.clerkUserId}>
                                        <TableCell className="font-medium">{customer.name}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={customer.role === 'admin' ? 'default' : 'secondary'}
                                                className={customer.role === 'admin' ? 'bg-green-600' : ''}
                                            >
                                                {customer.role === 'admin' ? '👑 Admin' : 'Customer'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{customer.phone || "-"}</TableCell>
                                        <TableCell>
                                            {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {actionLoading === customer.clerkUserId ? (
                                                <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                                            ) : customer.role === 'admin' ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleRemoveAdmin(customer.clerkUserId)}
                                                >
                                                    <ShieldOff className="h-4 w-4 mr-1" />
                                                    Demote
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 hover:text-green-700"
                                                    onClick={() => handleMakeAdmin(customer.clerkUserId)}
                                                >
                                                    <Shield className="h-4 w-4 mr-1" />
                                                    Make Admin
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {customers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            No customers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
