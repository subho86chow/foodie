"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Share2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { generateBill, type BillData } from "@/actions/billing";
import { toast } from "sonner";

interface Customer {
    clerkUserId: string;
    name: string;
    role: string | null;
}

export function AdminBillsClient({ customers }: { customers: Customer[] }) {
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [date, setDate] = useState<{ from: Date; to: Date } | undefined>();
    const [loading, setLoading] = useState(false);
    const [billData, setBillData] = useState<BillData | null>(null);

    const handleGenerate = async () => {
        if (!selectedUser || !date?.from || !date?.to) {
            toast.error("Please select a user and date range");
            return;
        }

        setLoading(true);
        try {
            const data = await generateBill(selectedUser, date.from, date.to);
            setBillData(data);
            toast.success("Bill generated successfully");
        } catch (error) {
            toast.error("Failed to generate bill");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const generateShareText = () => {
        if (!billData) return "";

        const lines = [
            `🍽️ *Meal Bill for ${billData.userName}*`,
            `📅 Period: ${billData.startDate} to ${billData.endDate}`,
            "",
            ...billData.meals.map(m => `▫️ ${m.date}: ${m.mealName} - ₹${m.price}`),
            "",
            `-------------------`,
            `🔢 Total Meals: ${billData.totalMeals}`,
            `💰 *Total Amount: ₹${billData.totalAmount}*`,
            `-------------------`,
        ];
        return lines.join("\n");
    };

    const copyToClipboard = () => {
        const text = generateShareText();
        navigator.clipboard.writeText(text);
        toast.success("Bill copied to clipboard");
    };

    const shareOnWhatsApp = () => {
        const text = encodeURIComponent(generateShareText());
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Generate Bill</CardTitle>
                    <CardDescription>Select a customer and date range to calculate the total.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Customer</label>
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((c) => (
                                        <SelectItem key={c.clerkUserId} value={c.clerkUserId}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium">Date Range</label>
                            <div className="grid gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date?.from ? (
                                                date.to ? (
                                                    <>
                                                        {format(date.from, "LLL dd, y")} -{" "}
                                                        {format(date.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(date.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Pick a date range</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={date?.from}
                                            selected={date}
                                            onSelect={(range: any) => setDate(range)}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGenerate} disabled={loading} className="w-full md:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Bill
                    </Button>
                </CardFooter>
            </Card>

            {billData && (
                <Card className="animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">Total: ₹{billData.totalAmount}</CardTitle>
                            <CardDescription>
                                {billData.totalMeals} meals from {billData.startDate} to {billData.endDate}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy to Clipboard">
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={shareOnWhatsApp} title="Share on WhatsApp">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b bg-muted/50">
                                <div>Date</div>
                                <div className="col-span-2">Meal</div>
                                <div className="text-right">Price</div>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {billData.meals.length === 0 ? (
                                    <div className="text-center p-8 text-muted-foreground">No meals found for this period.</div>
                                ) : (
                                    billData.meals.map((meal, i) => (
                                        <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0 hover:bg-muted/20">
                                            <div className="text-sm">{meal.date}</div>
                                            <div className="col-span-2 text-sm">{meal.mealName}</div>
                                            <div className="text-right text-sm">₹{meal.price}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
