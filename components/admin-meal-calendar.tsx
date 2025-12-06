"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
    getCustomersWhoAte,
    getCustomerMeals,
    getAllCustomers,
    addMealForCustomers,
    editMeal,
    deleteMealAdmin
} from "@/actions/admin-attendance";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, Users, ChevronLeft, Loader2 } from "lucide-react";

export function AdminMealCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [customerMeals, setCustomerMeals] = useState<any[]>([]);

    // Add meal modal state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [allCustomers, setAllCustomers] = useState<any[]>([]);
    const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
    const [mealName, setMealName] = useState("");
    const [price, setPrice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit meal state
    const [editingMeal, setEditingMeal] = useState<any>(null);
    const [editMealName, setEditMealName] = useState("");
    const [editPrice, setEditPrice] = useState("");

    useEffect(() => {
        if (date) {
            loadCustomersWhoAte();
            setSelectedCustomer(null);
        }
    }, [date]);

    useEffect(() => {
        if (selectedCustomer && date) {
            loadCustomerMeals();
        }
    }, [selectedCustomer]);

    const loadCustomersWhoAte = async () => {
        if (!date) return;
        setIsLoading(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const data = await getCustomersWhoAte(dateStr);
            setCustomers(data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const loadCustomerMeals = async () => {
        if (!selectedCustomer || !date) return;
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const data = await getCustomerMeals(selectedCustomer.userId, dateStr);
            setCustomerMeals(data);
        } catch (error) {
            toast.error("Failed to load meals");
        }
    };

    const loadAllCustomers = async () => {
        try {
            const data = await getAllCustomers();
            setAllCustomers(data);
        } catch (error) {
            toast.error("Failed to load customers");
        }
    };

    const handleOpenAddModal = () => {
        loadAllCustomers();
        setSelectedCustomerIds([]);
        setMealName("");
        setPrice("");
        setIsAddOpen(true);
    };

    const handleAddMeal = async () => {
        if (!date || !mealName || !price || selectedCustomerIds.length === 0) {
            toast.error("Please fill all fields and select at least one customer");
            return;
        }

        setIsSubmitting(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            await addMealForCustomers(selectedCustomerIds, mealName, parseFloat(price), dateStr);
            setIsAddOpen(false);
            loadCustomersWhoAte();
            toast.success(`Meal added for ${selectedCustomerIds.length} customer(s)`);
        } catch (error) {
            toast.error("Failed to add meal");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditMeal = async () => {
        if (!editingMeal || !editMealName || !editPrice) return;

        try {
            await editMeal(editingMeal.id, editMealName, parseFloat(editPrice));
            setEditingMeal(null);
            loadCustomerMeals();
            loadCustomersWhoAte();
            toast.success("Meal updated");
        } catch (error) {
            toast.error("Failed to update meal");
        }
    };

    const handleDeleteMeal = async (mealId: number) => {
        try {
            await deleteMealAdmin(mealId);
            loadCustomerMeals();
            loadCustomersWhoAte();
            toast.success("Meal deleted");
        } catch (error) {
            toast.error("Failed to delete meal");
        }
    };

    const toggleCustomerSelection = (customerId: string) => {
        setSelectedCustomerIds(prev =>
            prev.includes(customerId)
                ? prev.filter(id => id !== customerId)
                : [...prev, customerId]
        );
    };

    const selectAllCustomers = () => {
        setSelectedCustomerIds(allCustomers.map(c => c.clerkUserId));
    };

    return (
        <div className="space-y-4">
            {/* Header with Add Meal Button */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleOpenAddModal}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Meal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add Meal for Customers</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input value={date ? format(date, 'PPP') : ''} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Meal Name</Label>
                                <Input
                                    placeholder="e.g. Lunch"
                                    value={mealName}
                                    onChange={(e) => setMealName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Price (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Select Customers</Label>
                                    <Button variant="ghost" size="sm" onClick={selectAllCustomers}>
                                        Select All
                                    </Button>
                                </div>
                                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                                    {allCustomers.map((customer) => (
                                        <div key={customer.clerkUserId} className="flex items-center gap-2">
                                            <Checkbox
                                                id={customer.clerkUserId}
                                                checked={selectedCustomerIds.includes(customer.clerkUserId)}
                                                onCheckedChange={() => toggleCustomerSelection(customer.clerkUserId)}
                                            />
                                            <label htmlFor={customer.clerkUserId} className="text-sm cursor-pointer">
                                                {customer.name}
                                            </label>
                                        </div>
                                    ))}
                                    {allCustomers.length === 0 && (
                                        <p className="text-muted-foreground text-sm">Loading customers...</p>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {selectedCustomerIds.length} customer(s) selected
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleAddMeal} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Add Meal
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Calendar */}
                <Card className="p-0">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">Select Date</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="w-full"
                        />
                    </CardContent>
                </Card>

                {/* Customers List */}
                <Card className="p-0">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Customers ({date?.toDateString()})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        {isLoading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {customers.map((customer) => (
                                    <div
                                        key={customer.userId}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedCustomer?.userId === customer.userId
                                                ? 'bg-primary/10 border-primary'
                                                : 'hover:bg-muted'
                                            }`}
                                        onClick={() => setSelectedCustomer(customer)}
                                    >
                                        <p className="font-medium">{customer.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {customer.mealCount} meal(s) • ₹{customer.totalPrice.toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                                {customers.length === 0 && (
                                    <p className="text-muted-foreground text-center py-4">
                                        No customers ate on this day.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Customer Details */}
                <Card className="p-0">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">
                            {selectedCustomer ? (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => setSelectedCustomer(null)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    {selectedCustomer.name}'s Meals
                                </div>
                            ) : (
                                "Select a Customer"
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        {!selectedCustomer ? (
                            <p className="text-muted-foreground text-center py-4">
                                Click on a customer to view their meals
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {customerMeals.map((meal) => (
                                    <div key={meal.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{meal.mealName}</p>
                                            <p className="text-sm text-muted-foreground">₹{meal.price}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setEditingMeal(meal);
                                                    setEditMealName(meal.mealName);
                                                    setEditPrice(meal.price);
                                                }}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteMeal(meal.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {customerMeals.length === 0 && (
                                    <p className="text-muted-foreground text-center py-4">
                                        No meals found.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Edit Meal Dialog */}
            <Dialog open={!!editingMeal} onOpenChange={(open) => !open && setEditingMeal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Meal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Meal Name</Label>
                            <Input
                                value={editMealName}
                                onChange={(e) => setEditMealName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Price (₹)</Label>
                            <Input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingMeal(null)}>Cancel</Button>
                        <Button onClick={handleEditMeal}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
