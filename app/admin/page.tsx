import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, Receipt, ArrowRight } from "lucide-react";

export default async function AdminDashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const cards = [
        {
            title: "Customers",
            description: "Manage users & admin roles",
            href: "/admin/customers",
            icon: Users,
            color: "bg-blue-500/10 text-blue-600",
            buttonLabel: "Manage Users"
        },
        {
            title: "Bills",
            description: "Generate monthly bills",
            href: "/admin/bills",
            icon: Receipt,
            color: "bg-purple-500/10 text-purple-600",
            buttonLabel: "Generate Bills"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">Manage your meal tracking system</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <Card key={card.href} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
                        <CardHeader className="pb-3">
                            <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                                <card.icon className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-xl">{card.title}</CardTitle>
                            <CardDescription>{card.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full group-hover:bg-primary/90">
                                <Link href={card.href} className="flex items-center justify-center gap-2">
                                    {card.buttonLabel}
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
