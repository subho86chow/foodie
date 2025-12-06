import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MealCalendar } from "@/components/meal-calendar";
import { AdminMealCalendar } from "@/components/admin-meal-calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getRecentMeals, getMonthlyStats } from "@/actions/attendance";
import { checkAdminStatus } from "@/actions/auth";
import { format } from "date-fns";
import { Utensils, IndianRupee, Clock, CalendarDays } from "lucide-react";

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const isAdmin = await checkAdminStatus();

    if (isAdmin) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <AdminMealCalendar />
            </div>
        );
    }

    const recentMeals = await getRecentMeals();
    const stats = await getMonthlyStats();

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent w-fit">
                    {greeting}
                </h1>
                <p className="text-muted-foreground text-lg">Here's your meal summary for this month.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalSpend}</div>
                        <p className="text-xs text-muted-foreground">Current month</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMeals}</div>
                        <p className="text-xs text-muted-foreground">Current month</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Meal</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">
                            {recentMeals[0]?.mealName || "None"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {recentMeals[0] ? format(new Date(recentMeals[0].date), 'MMM dd') : "-"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        Meal Calendar
                    </h2>
                    <MealCalendar />
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Recent Activity
                    </h2>
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                            <CardDescription>Your last 5 meals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6 relative">
                                {/* Vertical line for timeline effect */}
                                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-muted"></div>

                                {recentMeals.map((meal) => (
                                    <div key={meal.id} className="relative flex items-center gap-4">
                                        {/* Dot */}
                                        <div className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary ring-4 ring-background">
                                            <div className="h-2 w-2 rounded-full bg-white" />
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{meal.mealName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(meal.date), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <div className="font-semibold text-sm">₹{meal.price}</div>
                                    </div>
                                ))}
                                {recentMeals.length === 0 && (
                                    <p className="text-muted-foreground text-sm pl-8">No recent activity recorded.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
