"use client";

import { useState, useEffect } from "react";
import { getMyBill } from "@/actions/billing";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, setMonth, setYear } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MyBillPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [month, setMonthStr] = useState<string>(new Date().getMonth().toString());
    const [year, setYearStr] = useState<string>(new Date().getFullYear().toString());
    const [billData, setBillData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'month' | 'custom'>('month');
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
    });

    useEffect(() => {
        if (mode === 'month') {
            const newDate = new Date(parseInt(year), parseInt(month));
            setDateRange({
                from: startOfMonth(newDate),
                to: endOfMonth(newDate)
            });
        }
    }, [month, year, mode]);

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            loadBill();
        }
    }, [dateRange]);

    const loadBill = async () => {
        if (!dateRange?.from || !dateRange?.to) return;

        setIsLoading(true);
        try {
            const fromStr = format(dateRange.from, 'yyyy-MM-dd');
            const toStr = format(dateRange.to, 'yyyy-MM-dd');
            const data = await getMyBill(fromStr, toStr);
            setBillData(data);
        } catch (error) {
            toast.error("Failed to load bill");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold">My Bill</h1>

                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                    <Button
                        variant={mode === 'month' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setMode('month')}
                    >
                        Monthly
                    </Button>
                    <Button
                        variant={mode === 'custom' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setMode('custom')}
                    >
                        Custom Range
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    {mode === 'month' ? (
                        <>
                            <Select value={month} onValueChange={setMonthStr}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={year} onValueChange={setYearStr}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[2024, 2025, 2026].map(y => (
                                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] justify-start text-left font-normal",
                                            !dateRange?.from && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange as any}
                                        onSelect={(range: any) => setDateRange(range)}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bill Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : billData ? (
                        <div className="space-y-6">
                            <div className="text-4xl font-bold text-primary">
                                ₹{billData.total.toFixed(2)}
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Breakdown</h3>
                                {Object.entries(billData.breakdown).map(([name, data]: [string, any]) => (
                                    <div key={name} className="flex flex-col p-4 bg-muted/50 rounded-lg gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{name}</span>
                                            <div className="text-right">
                                                <div className="font-bold">₹{data.total.toFixed(2)}</div>
                                                <div className="text-xs text-muted-foreground">{data.count} meals</div>
                                            </div>
                                        </div>
                                        {data.dates && data.dates.length > 0 && (
                                            <div className="text-xs text-muted-foreground border-t pt-2 mt-1">
                                                <span className="font-semibold">Date: </span>
                                                {data.dates.sort().map((d: string) => format(new Date(d), 'MMM d')).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {Object.keys(billData.breakdown).length === 0 && (
                                    <p className="text-muted-foreground">No meals found for this period.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Select a date range to view bill.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
