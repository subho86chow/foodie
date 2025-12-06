"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { getAttendance, addAttendance, removeAttendance } from "@/actions/attendance";
import { toast } from "sonner";
import { Trash2, Edit2 } from "lucide-react";

export function MealCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [mealName, setMealName] = useState("");
    const [price, setPrice] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const [editingMeal, setEditingMeal] = useState<any>(null);

    useEffect(() => {
        if (date) {
            loadAttendance();
        }
    }, [date]);

    // ... existing loadAttendance ...

    const loadAttendance = async () => {
        if (!date) return;
        setIsLoading(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const records = await getAttendance(dateStr);
            setAttendance(records);
        } catch (error) {
            toast.error("Failed to load meals");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!date || !mealName || !price) return;

        setIsSubmitting(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            await addAttendance(dateStr, mealName, parseFloat(price));
            setMealName("");
            setPrice("");
            setIsOpen(false);
            loadAttendance();
            toast.success("Meal added");
        } catch (error) {
            toast.error("Failed to add meal");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingMeal || !mealName || !price) return;

        setIsSubmitting(true);
        try {
            // Using a dynamic import or assuming updateMeal is exported from actions
            // We need to import updateMeal at the top of the file first
            const { updateMeal } = await import("@/actions/attendance");
            await updateMeal(editingMeal.id, mealName, parseFloat(price));

            setEditingMeal(null);
            setMealName("");
            setPrice("");
            loadAttendance();
            toast.success("Meal updated");
        } catch (error) {
            toast.error("Failed to update meal");
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEdit = (record: any) => {
        setEditingMeal(record);
        setMealName(record.mealName);
        setPrice(record.price);
    };

    const handleRemove = async (id: number) => {
        try {
            await removeAttendance(id);
            loadAttendance();
            toast.success("Meal removed");
        } catch (error) {
            toast.error("Failed to remove meal");
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2">
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

            <Card className="p-0">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">Meals for {date?.toDateString()}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : (
                            <>
                                {attendance.map((record) => (
                                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{record.mealName}</p>
                                            <p className="text-sm text-muted-foreground">₹{record.price}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => startEdit(record)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemove(record.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {attendance.length === 0 && (
                                    <p className="text-muted-foreground text-center py-4">No meals recorded.</p>
                                )}
                            </>
                        )}

                        {date && (
                            <>
                                {/* Add Meal Drawer */}
                                <Drawer open={isOpen} onOpenChange={setIsOpen}>
                                    <DrawerTrigger asChild>
                                        <Button className="w-full mt-4" onClick={() => {
                                            setMealName("");
                                            setPrice("");
                                        }}>Add Meal</Button>
                                    </DrawerTrigger>
                                    <DrawerContent>
                                        <div className="mx-auto w-full max-w-sm">
                                            <DrawerHeader>
                                                <DrawerTitle>Add Meal</DrawerTitle>
                                            </DrawerHeader>
                                            <div className="p-4 space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Meal Name</Label>
                                                    <Input
                                                        placeholder="e.g. Breakfast"
                                                        value={mealName}
                                                        onChange={(e) => setMealName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Price</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={price}
                                                        onChange={(e) => setPrice(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <DrawerFooter>
                                                <Button onClick={handleAdd} disabled={isSubmitting}>
                                                    {isSubmitting ? "Adding..." : "Add Meal"}
                                                </Button>
                                                <DrawerClose asChild>
                                                    <Button variant="outline">Cancel</Button>
                                                </DrawerClose>
                                            </DrawerFooter>
                                        </div>
                                    </DrawerContent>
                                </Drawer>

                                {/* Edit Meal Drawer */}
                                <Drawer open={!!editingMeal} onOpenChange={(open) => !open && setEditingMeal(null)}>
                                    <DrawerContent>
                                        <div className="mx-auto w-full max-w-sm">
                                            <DrawerHeader>
                                                <DrawerTitle>Edit Meal</DrawerTitle>
                                            </DrawerHeader>
                                            <div className="p-4 space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Meal Name</Label>
                                                    <Input
                                                        placeholder="e.g. Breakfast"
                                                        value={mealName}
                                                        onChange={(e) => setMealName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Price</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={price}
                                                        onChange={(e) => setPrice(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <DrawerFooter>
                                                <Button onClick={handleUpdate} disabled={isSubmitting}>
                                                    {isSubmitting ? "Updating..." : "Save Changes"}
                                                </Button>
                                                <Button variant="outline" onClick={() => setEditingMeal(null)}>Cancel</Button>
                                            </DrawerFooter>
                                        </div>
                                    </DrawerContent>
                                </Drawer>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
